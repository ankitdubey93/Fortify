import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Verify your email for Fortify",
    html: `
      <p>Thank you for signing up!</p>
      <p>Please click the link below to verify your email:</p>
      <a href="${url}">${url}</a>
    `,
  });

  console.log("Verification email sent: %s", info.messageId);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Reset your Fortify password",
    html: `
      <p>You requested to reset your password.</p>
      <p>Click below to reset it:</p>
      <a href="${url}">${url}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });

  console.log("Reset email sent: %s", info.messageId);
};
