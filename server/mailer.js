import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { text } from "node:stream/consumers";
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = +process.env.SMTP_PORT || 587;
const imapHost = process.env.IMAP_HOST;
const imapPort = +process.env.IMAP_PORT || 143;
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
  async listEmails(count = 10) {
    const client = new ImapFlow({
      host: imapHost,
      port: imapPort,
      secure: false, // Use true if your IMAP server supports SSL/TLS
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    const messages = [];
    await client.connect();

    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        for await (const message of client.fetch(`1:*`, {
          envelope: true,
        })) {
          messages.push(message);
        }
      } finally {
        lock.release();
      }

      console.log({ messages });

      return await Promise.all(
        messages.map(async (message) => {
          const { content } = await client.download(message.seq.toString());
          const textContent = await text(content, { encoding: "utf-8" });
          const { headers, attachments, headerLines, to, from, ...rest } =
            await simpleParser(textContent);
          return {
            ...rest,
            from: from.value,
            to: to.value,
          };
        }),
      );
    } finally {
      await client.logout();
      client.close();
    }
  },
};

export default mailer;
