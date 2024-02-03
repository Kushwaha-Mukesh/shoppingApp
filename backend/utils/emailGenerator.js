const nodemailer = require("nodemailer");

const mailGenerator = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: "adhikarymaruti@gmail.com", // sender email
    to: options.toEmail, // recipient email
    subject: options.subject, // subject of email
    text: options.text, // body of email
  };

  await transporter.sendMail(message);
};

module.exports = mailGenerator;
