// import { Injectable } from '@nestjs/common';
// import { createTransport } from 'nodemailer';

// @Injectable()
// export class MailService {
//   mailTransport = createTransport({
//     host: process.env.MAIL_HOST,
//     port: 587,
//     secure: true, // true for 465, false for other ports
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });

//   async sendMail(params: { to: string; subject: string; html: string }) {
//     const mailRes = await this.mailTransport.sendMail({
//       from: process.env.MAIL_FROM,
//       to: params.to,
//       subject: params.subject,
//       html: params.html,
//     });

//     return mailRes;
//   }
// }


import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';

@Injectable()
export class MailService {
  // Updated mailTransport configuration
  mailTransport = createTransport({
    host: process.env.MAIL_HOST,
    port: 587,  // Use 587 for TLS
    secure: false, // Use TLS (false for port 587)
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs for local dev
    },
  });

  // Function to send email
  async sendMail(params: { to: string; subject: string; html: string }) {
    try {
      const mailRes = await this.mailTransport.sendMail({
        from: process.env.MAIL_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      return mailRes;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Optionally throw to handle further in your app
    }
  }
}
