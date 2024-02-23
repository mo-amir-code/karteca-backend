import bcrypt from "bcrypt";
import { AuthSignupUserType } from "../types/user.js";
import crypto from "crypto";
import axios from "axios";

export const checkSignupItemsAndMakeStructured = async (
  body: AuthSignupUserType | null
): Promise<AuthSignupUserType> => {
  if (!body) {
    throw new Error("Request body is missing.");
  }

  const { name, email, gender, password, address, phone } = body;

  if (!name || !password || !email || !gender || !address) {
    throw new Error("Required fields are missing in the sign up form.");
  }

  const saltRound: number = parseInt(process.env.BCRYPT_SALT_ROUND || "12");

  const hashedPassword = await bcrypt.hash(password, saltRound);

  const referCode = generateReferCode(phone?.toString() || email.slice(0, 4));

  const result: AuthSignupUserType = {
    ...body,
    password: hashedPassword,
    referCode,
  };

  return result;
};

const generateReferCode = (telephone: string): string => {
  const phone = telephone.toString();
  const randomString = Math.random().toString(36).substring(2, 8).slice(0, 4);
  return (
    randomString + phone.slice(phone.length - 4, phone.length)
  ).toUpperCase();
};

export const generateOTP = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const getEarningLevelWise = (
  level: number,
  withdrawable: number
): number => {
  switch (level) {
    case 1:
      return withdrawable * 30;
    case 2:
      return withdrawable * 15;
    case 3:
      return withdrawable * 7;
    case 4:
      return withdrawable * 3;
    case 5:
      return withdrawable * 2;
    case 6:
      return withdrawable * 1;
    case 7:
      return withdrawable * 0.5;
    case 8:
      return withdrawable * 0.5;
    case 9:
      return withdrawable * 0.5;
    case 10:
      return withdrawable * 0.5;
    default:
      return 0;
  }
};

export const makePayment = async ({
  transactionId,
  userId,
  amount,
  redirectPath,
  mobileNumber,
}: {
  transactionId: string;
  userId: string;
  amount: number;
  redirectPath: string;
  mobileNumber: number;
}) => {
  const payload = {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    merchantTransactionId: transactionId,
    merchantUserId: userId,
    amount: amount * 100,
    redirectUrl: `${process.env.SERVER_ORIGIN}/api/v1${redirectPath}/${transactionId}`,
    redirectMode: "POST",
    callbackUrl: `${process.env.SERVER_ORIGIN}/api/v1${redirectPath}/${transactionId}`,
    mobileNumber: mobileNumber,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const dataPayload = JSON.stringify(payload);

  const dataBase64 = Buffer.from(dataPayload).toString("base64");

  const fullUrl = dataBase64 + "/pg/v1/pay" + process.env.PHONEPE_SALT_KEY;
  const dataSha256 = calculateSHA256(fullUrl);

  const checkSum = dataSha256 + "###" + process.env.PHONEPE_SALT_INDEX;

  const paymentAPI = `${process.env.PHONEPE_UAT_PAY_API_URL}/pay` || "";
  // console.log(paymentAPI);

  const response = await axios.post(
    paymentAPI,
    {
      request: dataBase64,
    },
    {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checkSum,
      },
    }
  );

  const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
  return redirectUrl;
};

export function calculateSHA256(input: string) {
  const hash = crypto.createHash("sha256");
  hash.update(input);
  return hash.digest("hex");
}
