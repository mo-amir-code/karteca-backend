import User, { UserType } from '../models/User.js';
import { sendMail } from '../services/sendOTP.js';
import {
    checkSignupItemsAndMakeStructured,
    generateOTP,
} from '../services/services.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { AuthSignupUserType } from '../types/user.js';

export interface MiddleRequestType {
    userId: string;
    isFromForgotPassword?: boolean;
}

interface MailOptionType {
    to: string;
    subject: string;
    html: string;
}

const jwtSecretKey: string | undefined = process.env.JWT_SECRET_KEY;

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const body = req.body as AuthSignupUserType | null;

        if (body === null) {
            return res.status(400).json({
                status: "failed",
                message: "Request body is missing or empty.",
            });
        }

      const newUser = await checkSignupItemsAndMakeStructured(body);

      if(!newUser){
        return res.status(400).json({
            status: "failed",
            message: "Something went wrong!",
        });
      }

      const { email } = newUser as AuthSignupUserType;
  
      const user: UserType | null = await User.findOne({ email });
  
      if (user && user.verified) {
        return res.status(400).json({
          status: "failed",
          message: "Your account is already registered.",
        });
      } else if (user) {
        req.body.userId = user._id;
        next();
        return;
      }
  
      const new_user: UserType = await User.create(newUser);
      req.body.userId = new_user._id;
      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: "Some Internal Error Occured!",
      });
    }
};

export const sendOTP = async (req: Request, res: Response) => {
    try {
      const { userId, isFromForgotPassword } = req.body;
      const user: UserType | null = await User.findById(userId);

      if(!user){
        return res.status(400).json({
            status: "failed",
            message: "User not found."
        })
      }
  
      let saltRoundString: string | undefined = process.env.BCRYPT_SALT_ROUND;

      if(!jwtSecretKey || !saltRoundString){
        return res.status(400).json({
            status: 'failed',
            message: "Internal Error Occurred!"
        })
      }

      const otp: number = generateOTP();
      const otpToken: string = jwt.sign({ userId: user._id }, jwtSecretKey);
  
      let mailOption:MailOptionType;
  
      if (!isFromForgotPassword) {
        mailOption = {
          to: user.email,
          subject: "OTP to verify your account.",
          html: `Your OTP is ${otp}, and click <a href="${process.env.CLIENT_ORIGIN}/auth/verify?token=${otpToken}">here</a> to verify your account`,
        };
      } else {
        mailOption = {
          to: user.email,
          subject: "OTP to change your password.",
          html: `Your OTP is ${otp}, and click <a href="${process.env.CLIENT_ORIGIN}/auth/reset?token=${otpToken}">here</a> to reset your password.`,
        };
      }


      let saltRound: number = parseInt(saltRoundString);
  
      const otpHash: string = await bcrypt.hash(otp.toString(), saltRound);
  
      user.otp = otpHash;
      user.otpExpiry = Date.now() + 15 * 60 * 1000;
      user.otpToken = otpToken;
      await user.save();
  
      await sendMail(mailOption);
      return res.status(200).json({
        status: "success",
        message: "OTP sent successfully",
        data: {
          otpToken,
          otp
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "Some Internal Error Occured!",
      });
    }
};

export const verify = async (req: Request, res: Response) => {
    try {
      const { token, otp } = req.body as {token?: string, otp?: number};
  
      if (!token || !otp) {
        return res.status(400).json({
          status: "failed",
          message: "Something missing."
        });
      }

      if(!jwtSecretKey){
        return res.status(400).json({
            status: "failed",
            message: "Some Internal Error Occured!"
        })
      }
  
      const { userId } = jwt.decode(token, {json: true}) as { userId?: string };
  
      const user = await User.findById(userId);
      const isOTPCorrect = await bcrypt.compare(otp.toString(), user.otp);
  
      if (!isOTPCorrect) {
        res.status(400).json({
          status: "failed",
          message: "Entered OTP is incorrect",
        });
        return;
      }
  
      if (!(user.otpExpiry > Date.now())) {
        res.status(400).json({
          status: "failed",
          message: "OTP is expired.",
        });
        return;
      }
  
      const sessionToken = jwt.sign({ userId }, jwtSecretKey);
      res.cookie('sessiontoken', sessionToken, {
        maxAge: Date.now() + (4 * 24 * 60 * 60 * 1000), // Expires after 4 days
        // httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        // secure: true // Ensures the cookie is sent only over HTTPS
      });
  
      user.verified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.otpToken = undefined;
      user.sessionToken = sessionToken;
      await user.save();
  
      return res.status(200).json({
        status: "success",
        message: "Account created successfully.",
        data: {
          userId: user._id,
          name: user.name,
          referCode: user.referCode,
          earning: user.referralEarning,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "Some Internal Error Occured!",
      });
    }
  };

export const signin = async (req: Request, res: Response) => {
    try {
      const { email, phone, password }: { email: string, phone: string, password: string } = req.body;
      
      if (!email && !phone) {
        return res.status(400).json({
          status: "failed",
          message: "Please provide email or phone number.",
        });
      }
      let user: UserType | null;
      
      if (email) {
        user = await User.findOne({ email });
      } else {
        user = await User.findOne({ phone });
      }
  
      if (!user) {
        return res.status(400).json({
          status: "failed",
          message: "You are not registered.",
        });
      }
  
      const isPasswordCorrect: boolean = await bcrypt.compare(password, user.password);
  
      if (!isPasswordCorrect) {
        return res.status(400).json({
          status: "failed",
          message: "Username or password is incorrect.",
        });
      }
  
      if (!jwtSecretKey) {
        return res.status(400).json({
          status: "failed",
          message: "Some Internal Error Occured!",
        });
      }
  
      const sessionToken: string = jwt.sign({ userId: user._id }, jwtSecretKey);
      user.sessionToken = sessionToken;
      await user.save();
  
      res.cookie('sessiontoken', sessionToken, {
        maxAge: Date.now() + (4 * 24 * 60 * 60 * 1000), // Expires after 4 days
        // httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        // secure: true // Ensures the cookie is sent only over HTTPS
      });
  
      return res.status(200).json({
        status: "success",
        message: "You are logged in. Enjoy!",
        user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "failed",
        message: "Some Internal Error Occurred!",
      });
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone }: { email: string, phone: string } = req.body;
    let user: UserType | null;

    if (!email && !phone) {
      res.status(400).json({
        status: "failed",
        message: "Please provide email or phone number.",
      });
      return;
    }

    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "You are not registered.",
      });
    }

    req.body.userId = user._id;
    req.body.isFromForgotPassword = true;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Some Internal Error Occured!",
    });
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword, otp } = req.body;

    if (!token || !newPassword || !otp) {
      return res.status(400).json({
        status: "failed",
        message: "Something missing.",
      });
    }

    if(!jwtSecretKey){
      return res.status(400).json({
        status: "failed",
        message: "Some Internal Error Occured!"
      })
    }

    const { userId } = jwt.verify(token, jwtSecretKey) as { userId: string };
    const user = await User.findById(userId);

    const isOTPCorrect = await bcrypt.compare(otp.toString(), user.otp);
    if (!isOTPCorrect) {
      res.status(400).json({
        status: "failed",
        message: "OTP incorrect."
      });
      return;
    }

    if (!(user.otpExpiry > Date.now())) {
      res.status(400).json({
        status: "failed",
        message: "OTP is expired."
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpToken = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed."
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Some Internal Error Occured!",
    });
  }
};