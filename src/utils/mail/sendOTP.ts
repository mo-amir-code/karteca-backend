import { Resend } from "resend";
import nodemailer from 'nodemailer';
import { EMAIL_ID, MAIL_PASS_KEY, RESEND_API_KEY } from '../constants.js';


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: EMAIL_ID as string, // your Gmail address
        pass: MAIL_PASS_KEY as string // your Gmail password or App Password
    }
});

const resend = new Resend(RESEND_API_KEY);

export interface MailOptions {
    to: string[];
    subject: string;
    html: string;
}

export const sendMail = async ({ to, subject, html }: MailOptions): Promise<any> => {
    try {
        let mailOptions = {
            from:`onboarding@resend.dev`,
            to,
            subject,
            html
        };

        const { data, error } =  await resend.emails.send(mailOptions);

        if (error) {
            console.error(error)
        }

    } catch (error) {
        console.log(error);
    }
}

export const sendAdminMail = async ({ to, subject, html }: MailOptions): Promise<any> => {
    try {
        let mailOptions = {
            from:`karteca.com`,
            to,
            subject,
            html
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}