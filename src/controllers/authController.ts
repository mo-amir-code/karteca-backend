import User, { UserType } from "../models/User.js";
import { MailOptions, sendMail } from "../utils/sendOTP.js";
import {
  checkSignupItemsAndMakeStructured,
  generateOTP,
} from "../utils/services.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthSignupUserType } from "../types/user.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import ReferMember from "../models/ReferMember.js";
import { redis } from "../utils/Redis.js";
import ReferralLevelModel from "../models/ReferralLevel.js";

export type MiddleRequestType = {
  userId: string;
  isFromForgotPassword?: boolean;
};

const jwtSecretKey: string | undefined = process.env.JWT_SECRET_KEY;

export const signup = TryCatch(async (req, res, next) => {
  const body = req.body as AuthSignupUserType | null;

  if (body === null) {
    return next(new ErrorHandler("Enter all required field", 400));
  }

  const newUser = await checkSignupItemsAndMakeStructured(body);

  if (!newUser) {
    return next(new ErrorHandler("Something went wrong!", 400));
  }

  if(newUser.referredUserReferCode){
    const isReferredUserReferCodeIsValid = await ReferMember.findOne({ referCode: newUser.referredUserReferCode });
    if(!isReferredUserReferCodeIsValid){
      return next(new ErrorHandler("Referral code is incorrect", 401));
    }
  }
    
  const { email, gender } = newUser as AuthSignupUserType;

  const user: UserType | null = await User.findOne({ email });

  if (user && user.verified) {
    return next(new ErrorHandler("This email is already registered.", 409));
  } else if (user) {
    req.body.userId = user._id;
    return next();
  }

  if(!gender){
    return res.status(400).json({
      success: false,
      message: "Enter atleast first character of gender"
    });
  }

  const new_user = await User.create(newUser);
  const referMemberData = {
    userId: new_user._id,
    referCode: newUser.referCode,
    referredUserReferCode: newUser.referredUserReferCode || undefined
  } 
  const newReferUser = await ReferMember.create(referMemberData);
  req.body.userId = new_user._id;

  if(newReferUser.referredUserReferCode){
    let level = 1;
    let referredMember = await ReferMember.findOne({ referCode: newReferUser.referredUserReferCode });

    while(referredMember && level <= 7){
      const referredLevel = await ReferralLevelModel.findOne({ $and: [{ userId: referredMember.userId }, { level: level }] });
      if(referredLevel) referredLevel.users.push({ earning: 0, isWithdrawalEnabled: false, user: new_user._id}); 
      else await ReferralLevelModel.create({ level: level, userId: referredMember.userId, users: [{ user: new_user._id, earning: 0, isWithdrawalEnabled: false }] });

      await redis.del(`userReferShortDashboard-${referredMember.userId}`);
      await redis.del(`userReferDashboard-${referredMember.userId}`);

      referredMember = (await ReferMember.findOne({ referCode: referredMember.referredUserReferCode })) || undefined;
      level += 1;
    }
  }

  next();
});

export const sendOTP = TryCatch(async (req, res, next) => {
  const { userId, isFromForgotPassword } = req.body;
  const user: UserType | null = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found.", 400));
  }

  let saltRoundString: string | undefined = process.env.BCRYPT_SALT_ROUND;

  if (!jwtSecretKey || !saltRoundString) {
    return next(new ErrorHandler("Internal Error Occurred!", 500));
  }

  const otp: number = generateOTP();
  const otpToken: string = jwt.sign({ userId: user._id }, jwtSecretKey);

  let mailOption: MailOptions;

  if (!isFromForgotPassword) {
    mailOption = {
      from:'karteca.in OTP Verification',
      to: [user.email],
      subject: "OTP to verify your account.",
      html: `Your OTP is ${otp}, and click <a href="${process.env.CLIENT_ORIGIN}/auth/verify?token=${otpToken}">here</a> to verify your account`,
    };
  } else {
    mailOption = {
      from:'karteca.in OTP Verification',
      to: [user.email],
      subject: "OTP to change your password.",
      html: `Your OTP is ${otp}, and click <a href="${process.env.CLIENT_ORIGIN}/auth/reset-password?token=${otpToken}">here</a> to reset your password.`,
    };
  }

  let saltRound: number = parseInt(saltRoundString);

  const otpHash: string = await bcrypt.hash(otp.toString(), saltRound);

  user.otp = otpHash;
  user.otpExpiry =  Date.now() + 15 * 60 * 1000;
  user.otpToken = otpToken;
  await user.save();

  res.cookie("otptoken", otpToken, {
    maxAge:  15 * 60 * 1000, // 15 minutes
    domain: process.env.ROOT_DOMAIN, // Set to the root domain
    secure: true, // Ensure the cookie is sent only over HTTPS
    httpOnly: true,  // Makes the cookie accessible only via HTTP(S) requests, not JavaScript 
    sameSite: 'none'
  });


  await sendMail(mailOption);
  return res.status(200).json({
    success: true,
    message: "OTP sent successfully"
  });
});

export const verify = TryCatch(async (req, res, next) => {
    const { otp } = req.body as { otp?: number };
    const token = req.cookies["otptoken"];

    if (!token || !otp) {
      return next(new ErrorHandler("Something missing.", 400));
    }

    if (!jwtSecretKey) {
      return next(new ErrorHandler("Internal Error Occurred!", 500));
    }

    const { userId } = jwt.verify(token, jwtSecretKey) as { userId?: string };

    if(!userId){
      return next(new ErrorHandler("Something went wrong with token", 400));
    }

    const user = await User.findById(userId);
    const isOTPCorrect = await bcrypt.compare(otp.toString(), user.otp);

    if (!isOTPCorrect) {
      return next(new ErrorHandler("Entered OTP is incorrect.", 400));
    }

    if (!(user.otpExpiry > Date.now())) {
      return next(new ErrorHandler("OTP is expired.", 400));
    }

    const sessionToken = jwt.sign({ userId }, jwtSecretKey);

    res.cookie("sessiontoken", sessionToken, {
      maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days
      domain: process.env.ROOT_DOMAIN, // Set to the root domain
      secure: true, // Ensure the cookie is sent only over HTTPS
      httpOnly: true,  // Makes the cookie accessible only via HTTP(S) requests, not JavaScript 
      sameSite: "none"
    });

    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpToken = undefined;
    user.sessionToken = sessionToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account verified successfully.",
      data: {
        userId: user._id,
        name: user.name,
        role: user.role
      },
    });
});

export const signin = TryCatch(async (req, res, next) => {
    const {
      email,
      phone,
      password,
    }: { email: string; phone?: string; password: string } = req.body;
    

    if (!email && !phone) {
      return next(new ErrorHandler("Please provide all the required field.", 400));
    }
    let user: UserType | null;

    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ phone });
    }


    if (!user) {
      return next(new ErrorHandler("You are not registered.", 400));
    }

    const isPasswordCorrect: boolean = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return next(new ErrorHandler("Username or password is incorrect", 400));
    }

    if (!jwtSecretKey) {
      return next(new ErrorHandler("Internal Error Occurred!", 400));
    }

    const sessionToken: string = jwt.sign({ userId: user._id }, jwtSecretKey);
    user.sessionToken = sessionToken;
    await user.save();


    res.cookie("sessiontoken", sessionToken, {
      maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days
      domain: process.env.ROOT_DOMAIN, // Set to the root domain
      secure: true, // Ensure the cookie is sent only over HTTPS
      httpOnly: true,  // Makes the cookie accessible only via HTTP(S) requests, not JavaScript 
      sameSite: 'none'
    });
    

    // res.setHeader("Set-Cookie", `sessiontoken=${sessionToken}; Max-Age:345600`)

    return res.status(200).json({
      success: true,
      message: "You are logged in. Enjoy!",
      data: {
        userId:user._id,
        name:user.name,
        role: user.role
      },
    });
});

export const forgotPassword = TryCatch(async (
  req,
  res,
  next
) => {
    const { email, phone }: { email: string; phone: string } = req.body;
    let user;

    if (!email && !phone) {
      return next(new ErrorHandler("Please provide email or phone number.", 400));
    }

    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return next(new ErrorHandler("You are not registered.", 400));
    }

    req.body.userId = user._id;
    req.body.isFromForgotPassword = true;
    next();
});

export const resetPassword = TryCatch(async (
  req,
  res,
  next
) => {
    const { token:isToken, newPassword, otp } = req.body;

    let token;
    
    if(isToken){
      token = isToken;
    }else{
      token = req.cookies["otptoken"];
    }

    if (!token || !newPassword || !otp) {
      return next(new ErrorHandler("Something is missing.", 400));
    }

    if (!jwtSecretKey) {
      return next(new ErrorHandler("Internal Error Occurred!", 400));
    }

    const { userId } = jwt.verify(token, jwtSecretKey) as { userId: string };
    const user = await User.findById(userId);

    const isOTPCorrect = await bcrypt.compare(otp.toString(), user.otp);
    if (!isOTPCorrect) {
      return next(new ErrorHandler("OTP is incorrect.", 400));
    }

    if (!(user.otpExpiry > Date.now())) {
      return next(new ErrorHandler("OTP is expired.", 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpToken = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed.",
    });
});

export const resendOTP = TryCatch(async (
  req,
  res,
  next
) => {
    const { token:isToken } = req.body;


    let token;
    
    if(isToken){
      token = isToken;
    }else{
      token = req.cookies["otptoken"];
    }

    if (!token) {
      console.log(token)
      return next(new ErrorHandler("Something is missing.", 400));
    }

    if (!jwtSecretKey) {
      return next(new ErrorHandler("Internal Error Occurred!", 400));
    }

    const { userId } = jwt.verify(token, jwtSecretKey) as { userId: string };
    const user = await User.findById(userId);

    if (!(user.otpExpiry > Date.now())) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.otpToken = undefined;
      await user.save();
      return next(new ErrorHandler("Verification session is expired", 401));
    }

    req.body.userId = userId;
    next();
});