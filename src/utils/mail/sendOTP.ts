import { Resend } from "resend";
import nodemailer from 'nodemailer';
import { DEVELOPMENT, DOMAIN, EMAIL_ID, MAIL_PASS_KEY, RESEND_API_KEY } from '../constants.js';


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

interface MailReturnType{
    msg:string,
    success: boolean
}

const from = (DEVELOPMENT === "vercel" || DEVELOPMENT === "development")? "onboarding@resend.dev" : `noreply@${DOMAIN}`;

export const sendMail = async ({ to, subject, html }: MailOptions): Promise<MailReturnType> => {
    try {
        let mailOptions = {
            from,
            to,
            subject,
            html
        };

        const { data, error } =  await resend.emails.send(mailOptions);

        if (error) {
            throw new Error(error as any);
        }

        return {
             msg: "Mail sent successfully",
             success: true
        }

    } catch (error) {
        console.log(error);
        return {
            msg: "Mail is not send",
            success: false
        }
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