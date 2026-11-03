const nodemailer = require("nodemailer");

/**
 * Creates and configures the Nodemailer SMTP transporter.
 * Uses environment variables: EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS.
 */
function createTransporter() {
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
    const isSecure = process.env.EMAIL_SECURE === "true" || port === 465;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn(
            "[Email Service Warning] EMAIL_USER or EMAIL_PASS environment variables are not set. Outbound emails will fail until SMTP credentials are provided."
        );
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: {
            user,
            pass,
        },
        // Reasonable socket timeouts
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
}

/**
 * Generates an institutional responsive HTML email template for password reset.
 */
function getPasswordResetTemplate({ name, resetUrl, expireMinutes = 15 }) {
    const recipientName = name || "Balaji Computer Member";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Balaji Computer Account Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      padding: 32px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0;
      color: #f59e0b;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .message {
      font-size: 14px;
      color: #475569;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 36px;
      font-size: 15px;
      font-weight: 700;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    }
    .expiry-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 14px 18px;
      border-radius: 8px;
      font-size: 13px;
      color: #92400e;
      margin-bottom: 24px;
    }
    .link-fallback {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      background-color: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }
    .security-notice {
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      margin-top: 24px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 4px 0;
      font-size: 12px;
      color: #94a3b8;
    }
    .footer strong {
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>BALAJI COMPUTER</h1>
        <p>Learn Today, Lead Tomorrow.</p>
      </div>

      <div class="content">
        <div class="greeting">Hello ${recipientName},</div>
        <p class="message">
          We received a request to reset your <strong>Balaji Computer</strong> account password.
          Click the button below to securely configure a new password for your account.
        </p>

        <div class="btn-container">
          <a href="${resetUrl}" class="btn" target="_blank" rel="noopener noreferrer">
            RESET PASSWORD
          </a>
        </div>

        <div class="expiry-box">
          ⏱ <strong>Expiration Notice:</strong> This password reset link is valid for <strong>${expireMinutes} minutes</strong> and can only be used once.
        </div>

        <p class="message" style="margin-bottom: 8px;">If the button above does not work, copy and paste this secure link into your browser:</p>
        <div class="link-fallback">
          <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;" target="_blank" rel="noopener noreferrer">${resetUrl}</a>
        </div>

        <div class="security-notice">
          <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email. Your current password remains active and secure. If you suspect unauthorized access, please notify the institute administration immediately.
        </div>
      </div>

      <div class="footer">
        <p><strong>Balaji Computer Management System</strong></p>
        <p>Computer Coaching Institute | Practical Learning & Professional IT Skills</p>
        <p>&copy; ${new Date().getFullYear()} Balaji Computer. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
}

/**
 * Sends a password reset email using Nodemailer.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - Recipient full name or username
 * @param {string} options.resetUrl - Full secure password reset URL with token
 * @returns {Promise<Object>} Nodemailer send result
 */
async function sendPasswordResetEmail({ to, name, resetUrl }) {
    if (!to || !resetUrl) {
        throw new Error("Recipient email address and resetUrl are required to send password reset email.");
    }

    const transporter = createTransporter();
    const fromAddress = process.env.EMAIL_FROM || `"Balaji Computer" <${process.env.EMAIL_USER || "noreply@balajicomputer.edu"}>`;

    const mailOptions = {
        from: fromAddress,
        to,
        subject: "Reset Your Balaji Computer Account Password",
        html: getPasswordResetTemplate({ name, resetUrl, expireMinutes: 15 }),
        text: `Hello ${name || "Member"},\n\nWe received a request to reset your Balaji Computer account password.\n\nPlease use the following link to reset your password:\n${resetUrl}\n\nThis password reset link is valid for 15 minutes and can only be used once.\n\nIf you did not request this change, please ignore this email and contact the administrator if you suspect unauthorized activity.\n\nRegards,\nBalaji Computer Team\nLearn Today, Lead Tomorrow.`,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
}

module.exports = {
    createTransporter,
    sendPasswordResetEmail,
};
