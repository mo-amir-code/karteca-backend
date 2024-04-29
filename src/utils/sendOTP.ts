import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_ID as string, // your Gmail address
        pass: process.env.MAIL_PASS_KEY as string // your Gmail password or App Password
    }
});

export interface MailOptions {
    from:string;
    to: string[];
    subject: string;
    html: string;
}

export const sendMail = async ({ from, to, subject, html }: MailOptions): Promise<void> => {
    try {
        let mailOptions = {
            from,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}