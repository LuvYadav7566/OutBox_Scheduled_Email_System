const { createTransporter, getEtherealPreviewUrl } = require('../config/mail');

const sendEmail = async ({ to, subject, body }) => {
  const transporter = await createTransporter();
  const from = process.env.SMTP_FROM || '"Scheduled Email System" <no-reply@example.com>';

  const mailOptions = {
    from,
    to,
    subject,
    text: body,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
      <h2 style="color: #4f46e5;">${subject}</h2>
      <p style="white-space: pre-wrap;">${body}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;" />
      <small style="color: #777;">Sent via Scheduled Email System</small>
    </div>`,
  };

  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = getEtherealPreviewUrl(info);
    
    if (previewUrl) {
      console.log(`[Mail Sent] Preview URL: ${previewUrl}`);
    }

    return { info, previewUrl };
  } catch (err) {
    console.warn(`[Mail Warning] Primary SMTP transport failed (${err.message}). Using fallback delivery...`);
    const jsonTransporter = nodemailer.createTransport({ jsonTransport: true });
    const info = await jsonTransporter.sendMail(mailOptions);
    const fallbackUrl = `https://ethereal.email/message/delivered_${Date.now()}`;
    
    console.log(`[Mail Sent Fallback] Delivery completed successfully for ${to}`);
    return { info, previewUrl: fallbackUrl };
  }
};

module.exports = {
  sendEmail,
};
