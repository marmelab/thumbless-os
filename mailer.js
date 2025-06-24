import nodemailer from "nodemailer";

const mailer = {
  send: async (to, from, subject, body) => {
    console.log(
      `Sending email from ${from} to ${to} with subject "${subject}"`,
    );

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "hillary.lesch41@ethereal.email",
        pass: "Eb8KU2AHTwbPPgpYFz",
      },
    });

    let mailOptions = {
      from: "hillary.lesch41@ethereal.email",
      to,
      subject,
      text: body,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return "Email could not be sent: " + error.message;
      } else {
        console.log("Email sent: " + info.response);
        return "Email sent successfully";
      }
    });
  },
};

export default mailer;
