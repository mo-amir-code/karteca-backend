import User from "../models/User.js";
import { JWT_CURRENT_DATE } from "../utils/constants.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";
import jwt from "jsonwebtoken";

export const isValidRequest = TryCatch(async (req, res, next) => {
  const { sessiontoken } = await req.cookies;

  let user;

  try {
    const data = jwt.verify(sessiontoken, process.env.JWT_SECRET_KEY!);
    const { userId, exp } = data as { userId: string; exp: number };

    user = await User.findById(userId).select("sessionToken");

    if (user.sessionToken !== sessiontoken) {
      user.sessionToken = undefined;
      await user.save();
      res.cookie("isUserLoggedIn", "", {
        maxAge: 0, // 4 days
        domain: process.env.ROOT_DOMAIN, // Set to the root domain
        secure: true, // Ensure the cookie is sent only over HTTPS
        httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        sameSite: "none",
      });
      return next(new ErrorHandler("Your session has been expired", 401));
    }

    if (JWT_CURRENT_DATE > exp) {
      user.sessionToken = undefined;
      await user.save();
      res.cookie("isUserLoggedIn", "", {
        maxAge: 0, // 4 days
        domain: process.env.ROOT_DOMAIN, // Set to the root domain
        secure: true, // Ensure the cookie is sent only over HTTPS
        httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        sameSite: "none",
      });
      return next(new ErrorHandler("Your session token has been expired", 401));
    }

    next();
  } catch (error) {
    user.sessionToken = undefined;
    await user.save();
    res.cookie("isUserLoggedIn", "", {
      maxAge: 0, // 4 days
      domain: process.env.ROOT_DOMAIN, // Set to the root domain
      secure: true, // Ensure the cookie is sent only over HTTPS
      httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
      sameSite: "none",
    });
    return next(new ErrorHandler("Something gone wrong!", 400));
  }
});
