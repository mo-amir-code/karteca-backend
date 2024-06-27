import bcrypt from "bcrypt";
import { AuthSignupUserType } from "../types/user.js";
import crypto from "crypto";
import Cart from "../models/Cart.js";
import { redis } from "./redis/Redis.js";
import RatingAndReviews from "../models/RatingAndReviews.js";
import { ProductCardReturnType, ProductCardType } from "../types/product.js";
import jwt from "jsonwebtoken"
import { BCRYPT_SALT_ROUND, JWT_CURRENT_DATE, JWT_SECRET_KEY } from "./constants.js";
import { getProductDetailsKey, getUserCartCountKey, getUserCartItemKey, getUserCheckoutWalletsKey, getUserOrdersKey } from "./redis/redisKeys.js";

export const checkSignupItemsAndMakeStructured = async (
  body: AuthSignupUserType | null
): Promise<AuthSignupUserType> => {
  if (!body) {
    throw new Error("Request body is missing.");
  }

  const {
    name,
    email,
    gender,
    password,
    address,
    phone,
    referredUserReferCode,
  } = body;

  if (!name || !password || !email || !gender || !address) {
    throw new Error("Required fields are missing in the sign up form.");
  }

  const saltRound: number = parseInt(BCRYPT_SALT_ROUND || "12");

  const hashedPassword = await bcrypt.hash(password, saltRound);

  const referCode = generateReferCode(email);

  let newGender = gender.toLowerCase();

  switch (newGender[0]) {
    case "m":
      newGender = "male";
      break;
    case "f":
      newGender = "female";
      break;
    case "t":
      newGender = "transgender";
      break;
  }

  const result: AuthSignupUserType = {
    ...body,
    password: hashedPassword,
    gender: newGender as "male" | "female" | "transgender",
    referredUserReferCode: referredUserReferCode?.toUpperCase() || undefined,
    referCode,
  };

  return result;
};

const generateReferCode = (telephone: string): string => {
  const phone = telephone.replace(/[^a-zA-Z]/g, "").slice(0, 4);
  const randomString = Math.random().toString(36).substring(2, 8).slice(0, 4);
  return (randomString + phone.slice(phone.length - 4, phone.length))
    .toUpperCase()
    .slice(0, 6);
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

// export function calculateSHA256(input: string) {
//   const hash = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
//   hash.update(input);
//   return hash.digest("hex");
// }

export const calculateRatingAndReviews = async (ratingAndReviews: any[]) => {
  const totalRating = ratingAndReviews.filter(
    (item) => item.title !== undefined
  ).length;
  const totalReviews = ratingAndReviews.length - totalRating;

  let avgRating = await ratingAndReviews.reduce(
    (rate: number, current: any) => {
      return rate + current.rate;
    },
    0
  );

  avgRating = avgRating / ratingAndReviews.length;

  return { totalRating, totalReviews, avgRating };
};

export const clearCreateOrderCachedRedis = async ({
  userId,
}: {
  userId: string;
}) => {
  await Cart.deleteMany({ userId: userId });
  await redis?.del(getUserOrdersKey(userId));
  await redis?.del(getUserCartCountKey(userId));
  await redis?.del(getUserCartItemKey(userId));
  await redis?.del(getUserCheckoutWalletsKey(userId));
  await redis?.del(`userTransactions-${userId}`);
  await redis?.del(getUserCheckoutWalletsKey(userId));
};

export const returnWalletAmount = ({name, amount, totalAmount}:{name?:string | undefined, amount?:number | undefined, totalAmount:number}):number => {
  if(!name || !amount){
    return 0
  }

  if(name === "coinBalance"){
    if(totalAmount < 500){
       if(amount <= 10) return amount;
       else return 10 
    }else if(totalAmount <= 1000){
      if(amount <= 20) return amount;
      else return 20
    } else if(totalAmount <= 2000){
      if(amount <= 30) return amount;
      else return 30
    } else if(totalAmount > 2000){
      if(amount <= 40) return amount;
      else return 40
    }
    return 0
  }else return amount || 0
}

export const formatProductsDataForProductCard = async (products:ProductCardType[]): Promise<ProductCardReturnType[]>  => {
  return await Promise.all(
    products.map(async (item) => {

      const cachedProduct = await redis?.get(getProductDetailsKey(item._id));

      if (cachedProduct) {
        const data = JSON.parse(cachedProduct);
        return {
          ...data.product,
          ratingAndReviews: {
            totalRating: data?.avgRating,
            totalReviews: data?.totalRating,
            avgRating: data?.ratingAndReviews,
          },
        };
      }

      const ratingAndReviews = await RatingAndReviews.find({
        product: item._id,
      });

      const { totalReviews, avgRating, totalRating } =
        await calculateRatingAndReviews(ratingAndReviews);

      const newItem = await JSON.parse(JSON.stringify(item));

      return {
        ...newItem,
        thumbnail: (item.thumbnail as { url: string }).url,
        ratingAndReviews: {
          totalReviews,
          avgRating: avgRating > 0 ? avgRating : 0,
          totalRating
        },
      };
    })
  );
}

export const isJwtTokenExpired = (token:string | undefined): boolean => {
  if(!token){
    return true
  }

  const {exp} = jwt.verify(token, JWT_SECRET_KEY!) as {exp:number};

  if(JWT_CURRENT_DATE > exp){
    return true;
  }

  return false;
}

export const makeFirstLetterCap = (str:string): string => {
  let newStr:string | string[] = str.split(" ") as string[];
  return newStr.map((s) => s.at(0)?.toUpperCase() + s.slice(1)).join(" ") as string;
}