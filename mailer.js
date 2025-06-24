import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailName = process.env.EMAIL_NAME;

const mailer = {
  send: async (to, from, subject, body) => {
    console.log(
      `Sending email from ${from} to ${to} with subject "${subject}"`,
    );

    let transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    let mailOptions = {
      from: `${emailName} <${emailUser}>`,
      to,
      subject,
      text: body,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return false;
      } else {
        console.log("Email sent: " + info.response);
        return true;
      }
    });
  },
};

export default mailer;
