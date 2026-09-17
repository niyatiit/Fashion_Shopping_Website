import nodemailer from "nodemailer";

export const getBrandedEmailTemplate = ({
  title,
  preheader = "",
  bodyContent = "",
  buttonText = "",
  buttonUrl = "",
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f8f6; color: #161412; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e7e5e0; border-radius: 4px; overflow: hidden; }
    .header { background-color: #161412; padding: 24px; text-align: center; }
    .logo { color: #fbfbf9; font-size: 24px; font-weight: 700; letter-spacing: 1px; text-decoration: none; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 600; color: #161412; margin-bottom: 16px; }
    .btn { display: inline-block; background-color: #8C1D18; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 2px; font-weight: 500; font-size: 15px; margin: 24px 0; }
    .link-fallback { word-break: break-all; font-size: 13px; color: #76726d; margin-top: 16px; }
    .footer { border-top: 1px solid #e7e5e0; padding: 20px; text-align: center; font-size: 12px; color: #76726d; background-color: #fbfbf9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo">FASHIONHUB</span>
    </div>
    <div class="content">
      <h2 class="title">${title}</h2>
      ${bodyContent}
      ${
        buttonText && buttonUrl
          ? `<div style="text-align: center;">
              <a href="${buttonUrl}" class="btn" target="_blank">${buttonText}</a>
            </div>
            <p class="link-fallback">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${buttonUrl}" style="color: #8C1D18;">${buttonUrl}</a></p>`
          : ""
      }
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} FashionHub. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;
};

const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`\n📧 [EMAIL DISPATCH] To: ${to} | Subject: ${subject}`);

  // Extract any URL from the HTML to show easily in terminal for local testing
  const urlMatch = html ? html.match(/href="([^"]+)"/) : null;
  if (urlMatch) {
    console.log(`🔗 [ACTION LINK]: ${urlMatch[1]}`);
  }

  const transportConfig = process.env.EMAIL_SERVICE
    ? {
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000,
      }
    : {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000,
      };

  const transporter = nodemailer.createTransport(transportConfig);

  const info = await transporter.sendMail({
    from: `"FashionHub" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@fashionhub.com"}>`,
    to,
    subject,
    text: text || subject,
    html,
  });

  console.log(`✅ [EMAIL SENT] MessageId: ${info.messageId}\n`);
  return info;
};

export default sendEmail;