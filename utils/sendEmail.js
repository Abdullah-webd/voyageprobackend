import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
  port: 587,
  secure: false, 
    auth: {
      user: process.env.EMAIL_USER || "webmastersmma@gmail.com",
      pass: process.env.EMAIL_PASS || "dzzlinhxmmunnyfx", // App password
    },
  });

  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
