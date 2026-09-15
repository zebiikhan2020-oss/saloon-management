import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    await transporter.verify();
    console.log("✅ Gmail connected");

    const info = await transporter.sendMail({
      from: `"Salon Management" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error);
    throw error;
  }
}