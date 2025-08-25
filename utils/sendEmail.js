import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com",
  port: 587, // try 587 instead of 465
  secure: false, // false for 587// true for port 465
  auth: {
    user: "webmastersmma@gmail.com",
    pass: "hkefujrkxqzvghbt", // App password
  },
});

  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
