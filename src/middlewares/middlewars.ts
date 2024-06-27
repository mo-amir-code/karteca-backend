// import User from "../models/User.js";
import { redis } from "../utils/redis/Redis.js";
import { JWT_CURRENT_DATE, JWT_SECRET_KEY, ROOT_DOMAIN } from "../utils/constants.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";
import jwt from "jsonwebtoken";
import { getAuthUserKey } from "../utils/redis/redisKeys.js";

type MiddlewareUserType = {
  sessionToken: string,
  role: "user" | "admin"
}

export const isValidRequest = TryCatch(async (req, res, next) => {
  const { sessiontoken } = await req.cookies;

  let user:MiddlewareUserType | null;

  try {
    const data = jwt.verify(sessiontoken, JWT_SECRET_KEY!);
    const { userId, exp } = data as { userId: string; exp: number };

    const cachedData = await redis?.get(getAuthUserKey(userId));

    if(cachedData){
      user = JSON.parse(cachedData) as MiddlewareUserType | null
    }else{
      res.cookie("isUserLoggedIn", "", {
        maxAge: 0, // 4 days
        domain: ROOT_DOMAIN, // Set to the root domain
        secure: true, // Ensure the cookie is sent only over HTTPS
        httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        sameSite: "none",
      });
      return next(new ErrorHandler("Internal server error", 500));
    }

    if (user?.sessionToken !== sessiontoken) {
      // user.sessionToken = undefined;
      // await user.save();
      res.cookie("isUserLoggedIn", "", {
        maxAge: 0, // 4 days
        domain: ROOT_DOMAIN, // Set to the root domain
        secure: true, // Ensure the cookie is sent only over HTTPS
        httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        sameSite: "none",
      });
      return next(new ErrorHandler("Your session has been expired", 401));
    }

    if (JWT_CURRENT_DATE > exp) {
      // user.sessionToken = undefined;
      // await user.save();
      res.cookie("isUserLoggedIn", "", {
        maxAge: 0, // 4 days
        domain: ROOT_DOMAIN, // Set to the root domain
        secure: true, // Ensure the cookie is sent only over HTTPS
        httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        sameSite: "none",
      });
      return next(new ErrorHandler("Your session token has been expired", 401));
    }

    next();
  } catch (error) {
    // user.sessionToken = undefined;
    // await user.save();
    res.cookie("isUserLoggedIn", "", {
      maxAge: 0, // 4 days
      domain: ROOT_DOMAIN, // Set to the root domain
      secure: true, // Ensure the cookie is sent only over HTTPS
      httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
      sameSite: "none",
    });
    return next(new ErrorHandler("Something gone wrong!", 400));
  }
});

export const isAdminValidRequest = TryCatch(async (req, res, next) => {
  const { sessiontoken } = await req.cookies;

  let user:MiddlewareUserType | null;

  try {
    const data = jwt.verify(sessiontoken, JWT_SECRET_KEY!);
    const { userId, exp } = data as { userId: string; exp: number };

    const cachedData = await redis?.get(getAuthUserKey(userId));

    if(cachedData){
      user = JSON.parse(cachedData) as MiddlewareUserType | null
    }else{
      res.cookie("isUserLoggedIn", "", {
        maxAge: 0, // 4 days
        domain: ROOT_DOMAIN, // Set to the root domain
        secure: true, // Ensure the cookie is sent only over HTTPS
        httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        sameSite: "none",
      });
      return next(new ErrorHandler("Internal server error", 500));
    }

    if (user?.sessionToken !== sessiontoken) {
      // user.sessionToken = undefined;
      // await user.save();
      res.cookie("isUserLoggedIn", "", {
        maxAge: 0, // 4 days
        domain: ROOT_DOMAIN, // Set to the root domain
        secure: true, // Ensure the cookie is sent only over HTTPS
        httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        sameSite: "none",
      });
      return next(new ErrorHandler("Your session has been expired", 401));
    }

    if (JWT_CURRENT_DATE > exp) {
      // user.sessionToken = undefined;
      // await user.save();
      res.cookie("isUserLoggedIn", "", {
        maxAge: 0, // 4 days
        domain: ROOT_DOMAIN, // Set to the root domain
        secure: true, // Ensure the cookie is sent only over HTTPS
        httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
        sameSite: "none",
      });
      return next(new ErrorHandler("Your session token has been expired", 401));
    }

    if(user?.role !== "admin"){
      return next(new ErrorHandler("You have not admin permission", 403));
    }

    req.body.adminId = userId
    next();
  } catch (error) {
      // user?.sessionToken = undefined;
      // await user.save();
    res.cookie("isUserLoggedIn", "", {
      maxAge: 0, // 4 days
      domain: ROOT_DOMAIN, // Set to the root domain
      secure: true, // Ensure the cookie is sent only over HTTPS
      httpOnly: true, // Makes the cookie accessible only via HTTP(S) requests, not JavaScript
      sameSite: "none",
    });
    return next(new ErrorHandler("Something gone wrong!", 400));
  }
});
