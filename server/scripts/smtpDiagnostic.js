const path = require("path");
// Ensure server dependencies are resolvable
module.paths.push(path.resolve(__dirname, "../node_modules"));
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { verifySMTP, sendEmail, getSmtpConfig } = require("../config/mailer");

async function runSmtpDiagnostic() {
    console.log("================================================================================");
    console.log("  BALAJI COMPUTER - GMAIL SMTP LOCALHOST DIAGNOSTIC UTILITY");
    console.log("================================================================================\n");

    const config = getSmtpConfig();

    // 1. Check Configuration Values
    console.log("[1. Environment Configuration Inspection]");
    console.log(`  • EMAIL_HOST:       ${config.host}`);
    console.log(`  • EMAIL_PORT:       ${config.port}`);
    console.log(`  • EMAIL_SECURE:     ${config.isSecure}`);
    console.log(`  • EMAIL_USER:       ${config.user || "[NOT CONFIGURED]"}`);
    console.log(`  • EMAIL_PASS:       ${config.pass ? `[CONFIGURED: ${config.pass.length} chars (Hidden)]` : "[MISSING]"}`);
    console.log(`  • CLIENT_URL:       ${process.env.CLIENT_URL || "http://localhost:5173 (Default)"}`);
    console.log(`  • NODE_ENV:         ${process.env.NODE_ENV || "development"}`);

    if (!config.user || !config.pass) {
        console.error("\n[CRITICAL ERROR] EMAIL_USER or EMAIL_PASS is missing in server/.env!");
        console.error("Please ensure server/.env contains your Gmail address and 16-character App Password.");
        process.exit(1);
    }

    if (config.host.includes("@")) {
        console.warn("\n[WARNING] EMAIL_HOST contains '@'. It must be 'smtp.gmail.com', not an email address.");
    }

    // 2. Transporter Verification
    console.log("\n[2. Testing SMTP Handshake & Authentication (transporter.verify)]");
    console.log(`  Connecting to ${config.host}:${config.port}...`);

    const verifyResult = await verifySMTP();

    if (verifyResult.success) {
        console.log("  ✓ PASS: SMTP connection established and authenticated successfully!");
        console.log(`  ✓ Server Response: ${verifyResult.message}`);
    } else {
        console.error("  ✗ FAIL: SMTP verification failed.");
        console.error(`  • Failure Classification: ${verifyResult.failureType}`);
        console.error(`  • Error Code:             ${verifyResult.code || "N/A"}`);
        console.error(`  • Details:                ${verifyResult.error}`);

        console.log("\n[Troubleshooting Guidance]");
        if (verifyResult.failureType.includes("AUTHENTICATION")) {
            console.log("  1. Verify your Gmail account has 2-Step Verification enabled.");
            console.log("  2. Generate a new App Password at: https://myaccount.google.com/apppasswords");
            console.log("  3. Ensure EMAIL_USER matches the exact Gmail account that generated the App Password.");
        } else if (verifyResult.failureType.includes("NETWORK")) {
            console.log("  1. Check your internet connection / firewall.");
            console.log("  2. If port 465 is blocked by your ISP, try EMAIL_PORT=587 and EMAIL_SECURE=false.");
        }
        process.exit(1);
    }

    // 3. Test Actual Email Delivery
    console.log("\n[3. Testing Actual Email Delivery]");
    console.log(`  Dispatching test verification email to: ${config.user}...`);

    try {
        const testMailResult = await sendEmail({
            to: config.user,
            subject: "Balaji Computer - Gmail SMTP Verification Test",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">Balaji Computer Management System</h2>
          <p><strong>SMTP Test Successful!</strong></p>
          <p>This email confirms that your Gmail App Password and Nodemailer configuration are working on localhost.</p>
          <p style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Timestamp: ${new Date().toISOString()} | Host: localhost
          </p>
        </div>
      `,
            text: `Balaji Computer Management System\n\nSMTP Test Successful!\nThis email confirms that your Gmail App Password and Nodemailer configuration are working on localhost.\nTimestamp: ${new Date().toISOString()}`,
        });

        console.log("  ✓ PASS: Email dispatched successfully!");
        console.log(`  ✓ Message ID: ${testMailResult.messageId}`);
        console.log(`  ✓ Accepted by: ${testMailResult.accepted?.join(", ") || config.user}`);
    } catch (sendErr) {
        console.error("  ✗ FAIL: Test email could not be delivered.");
        console.error(`  • Error: ${sendErr.message}`);
        process.exit(1);
    }

    console.log("\n================================================================================");
    console.log("  ✓ SMTP DIAGNOSTIC COMPLETE: GMAIL SMTP IS FULLY OPERATIONAL ON LOCALHOST");
    console.log("================================================================================\n");
    process.exit(0);
}

runSmtpDiagnostic().catch((err) => {
    console.error("Fatal diagnostic error:", err);
    process.exit(1);
});

