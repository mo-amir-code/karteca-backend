import dotenv from "dotenv";
dotenv.config();

export const JWT_ALGO = "shhhhh";
export const COOKIE_AGE_4_DAY = 4 * 24 * 60 * 60 * 1000;
export const COOKIE_AGE_15_MIN = 15 * 60 * 1000;
export const JWT_AGE_4_DAYS = Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 4);
export const JWT_AGE_15_MIN = Math.floor(Date.now() / 1000 + 60 * 15);
export const JWT_CURRENT_DATE = Math.floor(Date.now() / 1000);
export const OTP_EXPIRY_IN_MINUTES = 15;
export const DOMAIN = "karteca.com"

// Environments Variables
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const ADMIN_MAIL_ID = process.env.ADMIN_MAIL_ID;
const ADMIN_UPI = process.env.ADMIN_UPI;
const COMPANY_NAME = process.env.COMPANY_NAME;
const PRIMARY_COLOR = process.env.PRIMARY_COLOR;
const MAIL_PASS_KEY = process.env.MAIL_PASS_KEY;
const EMAIL_ID = process.env.EMAIL_ID;
const SERVER_ORIGIN = process.env.SERVER_ORIGIN;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
const CLIENT_ORIGIN2 = process.env.CLIENT_ORIGIN2;
const BCRYPT_SALT_ROUND = process.env.BCRYPT_SALT_ROUND;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const DEVELOPMENT = process.env.DEVELOPMENT;
const ROOT_DOMAIN = process.env.ROOT_DOMAIN;
const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER;
const REDIS_LOCAL_PORT = process.env.REDIS_LOCAL_PORT;
const REDIS_URI = process.env.REDIS_URI;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export {
  PORT,
  MONGO_URI,
  ADMIN_MAIL_ID,
  ADMIN_UPI,
  COMPANY_NAME,
  PRIMARY_COLOR,
  ROOT_DOMAIN,
  MAIL_PASS_KEY,
  EMAIL_ID,
  SERVER_ORIGIN,
  CLIENT_ORIGIN,
  CLIENT_ORIGIN2,
  BCRYPT_SALT_ROUND,
  JWT_SECRET_KEY,
  DEVELOPMENT,
  CLOUD_NAME,
  API_KEY,
  API_SECRET,
  CLOUDINARY_FOLDER,
  REDIS_URI,
  REDIS_LOCAL_PORT,
  RESEND_API_KEY
};
