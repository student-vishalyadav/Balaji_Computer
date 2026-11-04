const path = require("path");
// Ensure .env is loaded
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const nodemailer = require("nodemailer");

let transporterInstance = null;

/**
 * Normalizes and validates SMTP configuration from environment variables.
 */
function getSmtpConfig() {
    let host = (process.env.EMAIL_HOST || "smtp.gmail.com").trim();
    const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
    const isSecure = process.env.EMAIL_SECURE === "true" || port === 465;
    let user = (process.env.EMAIL_USER || "").trim();
    // Google App Passwords often have spaces (e.g. "abcd efgh ijkl mnop") - strip them
    const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

    // Self-healing: if EMAIL_HOST was accidentally set to an email address
    if (host.includes("@")) {
        console.warn(
            `[Mailer Auto-Correction] EMAIL_HOST '${host}' looks like an email address. Defaulting SMTP host to 'smtp.gmail.com'.`
        );
        if (!user || user === "yourgmail@gmail.com") {
            user = host;
        }
        host = "smtp.gmail.com";
    }

    return { host, port, isSecure, user, pass };
}

/**
 * Returns a singleton Nodemailer transporter.
 */
function getTransporter() {
    if (transporterInstance) {
        return transporterInstance;
    }

    const { host, port, isSecure, user, pass } = getSmtpConfig();

    if (!user || !pass) {
        console.warn(
            "[Mailer Warning] EMAIL_USER or EMAIL_PASS is not configured. Email delivery will fail until SMTP credentials are provided."
        );
    }

    transporterInstance = nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: {
            user,
            pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });

    return transporterInstance;
}

/**
 * Verifies SMTP connection and authentication status.
 * @returns {Promise<{ success: boolean, host: string, port: number, user: string, error?: string, code?: string }>}
 */
async function verifySMTP() {
    const { host, port, user, pass } = getSmtpConfig();
    const transporter = getTransporter();

    try {
        await transporter.verify();
        return {
            success: true,
            host,
            port,
            user,
            hasPassword: Boolean(pass),
            message: "SMTP server is ready to accept and deliver messages.",
        };
    } catch (error) {
        let failureType = "UNKNOWN";
        if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
            failureType = "NETWORK_OR_HOST_RESOLUTION";
        } else if (error.responseCode === 535 || (error.message && error.message.includes("BadCredentials"))) {
            failureType = "AUTHENTICATION_FAILED (Check Gmail App Password & 2FA)";
        }

        return {
            success: false,
            host,
            port,
            user,
            hasPassword: Boolean(pass),
            failureType,
            error: error.message,
            code: error.code || error.responseCode,
        };
    }
}

/**
 * Reusable email sending function.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text body fallback
 * @param {string} [options.from] - Custom sender address
 * @returns {Promise<Object>} Nodemailer delivery result
 */
async function sendEmail({ to, subject, html, text, from }) {
    if (!to) {
        throw new Error("Recipient email address ('to') is required.");
    }
    if (!subject) {
        throw new Error("Email 'subject' is required.");
    }

    const { user } = getSmtpConfig();
    const transporter = getTransporter();

    const sender = from || `"Balaji Computer" <${user || "noreply@balajicomputer.edu"}>`;

    const mailOptions = {
        from: sender,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ""),
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.NODE_ENV !== "production") {
            console.log(`[Mailer] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
        }
        return info;
    } catch (error) {
        console.error(`[Mailer Error] Failed to send email to ${to}:`, error.message);
        throw error;
    }
}

module.exports = {
    getTransporter,
    verifySMTP,
    sendEmail,
    getSmtpConfig,
};

