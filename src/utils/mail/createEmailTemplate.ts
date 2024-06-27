import { COMPANY_NAME, PRIMARY_COLOR } from "../constants.js";

interface MailTemplateType {
    name: string;
    otp: number;
    message: string;
    link?: string;
    expireTime: number;
  }
  
  export const createEmailTemplate = ({
    name,
    message,
    otp,
    link,
    expireTime,
  }: MailTemplateType) => {
    const temp = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email OTP</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; margin: 0; padding: 0;">
          <div style="background-color: #ffffff; margin: 0 auto; padding: 20px; max-width: 600px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #744CCD; color: #ffffff; padding: 10px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0;">Your OTP Code</h1>
              </div>
              <div style="padding: 20px; text-align: center;">
                  <p style="margin: 0;">Dear ${name},</p>
                  <p style="margin: 0;">${message} ${link ? `or <a href="${link}">click here</a>` : ''}</p>
                  <div style="font-size: 24px; font-weight: bold; background-color: #f8f9fa; padding: 10px; border-radius: 8px; margin: 20px 0; display: inline-block; letter-spacing: 2px;">${otp}</div>
                  <p style="margin: 0;">This OTP is valid for the next ${expireTime} minutes.</p>
                  <p style="margin: 0;">If you did not request this OTP, please ignore this email.</p>
              </div>
              <div style="font-size: 12px; color: #777777; text-align: center; padding: 10px; border-top: 1px solid #dddddd; margin-top: 20px;">
                  <p style="margin: 0;">© 2024 ${COMPANY_NAME || 'Your Company'}. All rights reserved.</p>
                  <p style="margin: 0;">This is an automated message, please do not reply.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  
    return temp;
  };
  