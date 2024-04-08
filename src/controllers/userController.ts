import User from "../models/User.js";
import DeliveryAddress from "../models/DeliveryAddress.js";
import GiftCard from "../models/GiftCard.js";
import Card from "../models/Card.js";
import ReferMember from "../models/ReferMember.js";
import Coupon from "../models/Coupon.js";
import RatingAndReviews from "../models/RatingAndReviews.js";
import Notification from "../models/Notification.js";
import Wishlist from "../models/Wishlist.js";
import ReferralLevel from "../models/ReferralLevel.js";
import Transaction from "../models/Transaction.js";
import { getEarningLevelWise } from "../utils/services.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { CGiftCardType, CRatingAndReviewsType, CUserCardType, CUserDeliveryAddressType, CWishlistType, UpdateUserPasswordType, UserEditType } from "../types/user.js";
import { redis } from "../utils/Redis.js";
import bcrypt from "bcrypt"

export const fetchUserProfile = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  
  if (!userId) {
    return next(new ErrorHandler("Something is missing here", 404));
  }

  const catchedUserProfile = await redis.get(`userProfile-${userId}`);

  if(catchedUserProfile){
    return res.status(200).json({
      success: true,
      message: "User information fetched.",
      data: JSON.parse(catchedUserProfile)
    });
  }

  const user = await User.findById(userId).select("_id name gender email phone");

  await redis.set(`userProfile-${userId}`, JSON.stringify(user));

  return res.status(200).json({
    success: true,
    message: "User information fetched.",
    data: user,
  });
}); // redis done

export const editUser = TryCatch(async (req, res) => {
  const newUserUpdate = req.body as UserEditType;

  await User.findByIdAndUpdate(newUserUpdate.userId, newUserUpdate);

  await redis.del(`userProfile-${newUserUpdate.userId}`);

  return res.status(200).json({
    success: true,
    message: "Update user",
  });
}); // redis done

export const fetchUserAddresses = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const catchedAddresses = await redis.get(`userAddresses-${userId}`);

  if(catchedAddresses){
    return res.status(200).json({
      success: true,
      message: "User addresses fetched.",
      data: JSON.parse(catchedAddresses)
    });
  }

  const addresses = await DeliveryAddress.find({ userId });

  await redis.set(`userAddresses-${userId}`, JSON.stringify(addresses));

  return res.status(200).json({
    success: true,
    message: "User addresses fetched.",
    data: addresses,
  });
}); // redis done

export const addUserAddress = TryCatch(async (req, res, next) => {
  const address = req.body as CUserDeliveryAddressType;

  if(!address){
    return next(new ErrorHandler("Something is missing in the address.", 404));
  }

  await DeliveryAddress.create(address);

  await redis.del(`userAddresses-${address.userId}`);

  return res.status(200).json({
    success: true,
    message: "Delivery address added successfully."
  });
}); // redis done

export const deleteUserAddress = TryCatch(async (req, res, next) => {
  const {addressId} = req.body;

  if(!addressId){
    return next(new ErrorHandler("Address Id is missing", 404));
  }

  const deletedAddress = await DeliveryAddress.findByIdAndDelete(addressId);

  await redis.del(`userAddresses-${deletedAddress.userId}`);

  return res.status(200).json({
    success: true,
    message: "Address deleted successfully."
  });
}); // redis done

export const updateUserAddress = TryCatch(async (req, res, next) => {
  const address = req.body as CUserDeliveryAddressType;

  if(!address){
    return next(new ErrorHandler("Something is missing in the address.", 404));
  }

  await DeliveryAddress.findByIdAndUpdate(address._id, address, {new: true});

  await redis.del(`userAddresses-${address.userId}`);

  return res.status(200).json({
    success: true,
    message: "Delivery address updated successfully."
  });
}); // redis done

export const fetchUserWishlist = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const catchedWishlist = await redis.get(`userWishlist-${userId}`);

  if(catchedWishlist){
    return res.status(200).json({
      success: true,
      message: "User wishlist fetched.",
      data: JSON.parse(catchedWishlist)
    });
  }

  const wishlist = await Wishlist.findOne({ userId }).populate({
    path: "products",
    select: "title thumbnail price discount stock",
  });

  await redis.set(`userWishlist-${userId}`, JSON.stringify(wishlist));

  return res.status(200).json({
    success: true,
    message: "User wishlist fetched.",
    data: wishlist?.products || [],
  });
}); // redis done

export const createUserWishlistItems = TryCatch(async (req, res, next) => {
  const { userId, productId } = req.body;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  let wishlistItems;

  wishlistItems = await Wishlist.findOne({ userId });

  if(wishlistItems){
    wishlistItems.products.push(productId);
    await wishlistItems.save();

  }else{
    wishlistItems = await Wishlist.create({userId, products: [productId]});
  }
  
  await redis.del(`userWishlist-${userId}`);

  return res.status(200).json({
    success: true,
    message: "Item added in wishlist.",
  });
}); // redis done

export const fetchUserWishlistItems = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const wishlistItems = await Wishlist.findOne({ userId }).select("-userId");

  return res.status(200).json({
    success: true,
    message: "User wishlist Counted.",
    data: wishlistItems?.products || [],
  });
}); // No need of redis

export const deleteUserWishlistItems = TryCatch(async (req, res, next) => {
  const { userId, productId } = req.body;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  await redis.del(`userWishlist-${userId}`);

  await Wishlist.findOneAndUpdate({ userId }, {$pull: {products: productId}});

  return res.status(200).json({
    success: true,
    message: "Item deleted from the wishlist.",
  });
}); // redis done

export const addUserWishlist = TryCatch(async (req, res, next) => {
  const {userId, product} = req.body as CWishlistType;

  if(!product || !userId){
    return next(new ErrorHandler("Something is missing in the review.", 404));
  }

  await Wishlist.findOneAndUpdate({userId}, {$push: {products: product}});
  await redis.del(`userWishlist-${userId}`);
  
  return res.status(200).json({
    success: true,
    message: "Your wishlist added successfully."
  });
}); // redis done

export const fetchUserGiftCards = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const giftCards = await GiftCard.find({ gifterId: userId }).select(
    "-code -transactionId -gifterId -recieverId"
  );

  return res.status(200).json({
    success: true,
    message: "User gift cards fetched.",
    data: giftCards,
  });
});

export const fetchUserSavedCards = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const cards = await Card.find({ userId }).select(
    "cardServiceName cardNumber"
  );

  return res.status(200).json({
    success: true,
    message: "User gift cards fetched.",
    data: cards,
  });
});

export const fetchUserWallets = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const wallets = await User.findById(userId).select("mainBalance coinBalance");
  const referWallet = await ReferMember.findOne({ userId }).select(
    "referralEarning totalReferralEarning"
  );

  const allWallets = {
    mainBalance: wallets.mainBalance,
    coinBalance: wallets.coinBalance,
    referralEarning: referWallet.referralEarning,
    totalReferralEarning: referWallet.totalReferralEarning,
  };

  return res.status(200).json({
    success: true,
    message: "User wallets fetched.",
    data: allWallets,
  });
});

export const fetchUserCoupons = TryCatch(async (req, res) => {
  const coupons = await Coupon.find({ isClaimed: false }).select("-issuedBy");

  return res.status(200).json({
    success: true,
    message: "User coupons fetched.",
    data: coupons,
  });
});

export const fetchUserRatingAndReviews = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const ratingAndReviews = await RatingAndReviews.find({ userId }).populate({
    path: "product",
    select: "title thumbnail",
  });

  return res.status(200).json({
    success: true,
    message: "User Reviews fetched.",
    data: ratingAndReviews,
  });
});

export const fetchUserNotifications = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const ntfs = await Notification.find({ userId });

  return res.status(200).json({
    success: true,
    message: "User notifications fetched.",
    data: ntfs,
  });
});

export const fetchUserReferralDashboard = TryCatch(async (req, res, next) => {
    const { userId } = req.query;

    if (!userId) {
      return next(new ErrorHandler("Something is missing here.", 404));
    }

    const referMemeberData = await ReferMember.findOne({ userId }).select(
      "-userId -referredUserReferCode"
    );
    const referralLevels = await ReferralLevel.find({ userId }).select(
      "-userId"
    );

    const eachLevelReferralEarning = referralLevels.map(async (rl) => {
      const users = rl.users.map(async (userId) => {
        const user = await ReferMember.findOne({ userId }).select(
          "withdrawalPermission"
        );

        let isWithdrawable = false;

        if (user.withdrawalPermission) isWithdrawable = true;
        return isWithdrawable;
      });

      const withdrawable = users.filter((u) => u).length;
      const unWithdrawable = users.filter((u) => !u).length;

      return {
        level: rl.level,
        withdrawable,
        unWithdrawable,
        earning: getEarningLevelWise(rl.level, withdrawable),
      };
    });

    const withdrawalHistory = await Transaction.find({
      $and: [{ userId }, { type: "withdrawal" }, { mode: "referral" }],
    }).select("createdAt amount status");

    return res.status(200).json({
      success: true,
      message: "User referral dashboard fetched.",
      data: {
        referMemeberData,
        eachLevelReferralEarning,
        withdrawalHistory,
      },
    });
});

export const addGiftCard = TryCatch(async (req, res, next) => {
  const giftCard = req.body as CGiftCardType;

  if(!giftCard){
    return next(new ErrorHandler("Something is missing in the GiftCard.", 404));
  }


  return res.status(200).json({
    success: true,
    message: "Gift Card created successfully."
  });
});

export const addUserCard = TryCatch(async (req, res, next) => {
  const userCard = req.body as CUserCardType;

  if(!userCard){
    return next(new ErrorHandler("Something is missing in the card information.", 404));
  }

  await Card.create(userCard);
  
  return res.status(200).json({
    success: true,
    message: "User Card added successfully."
  });
});

export const addUserReview = TryCatch(async (req, res, next) => {
  const review = req.body as CRatingAndReviewsType;

  if(!review){
    return next(new ErrorHandler("Something is missing in the review.", 404));
  }

  await RatingAndReviews.create(review);
  
  return res.status(200).json({
    success: true,
    message: "Your review added successfully."
  });
});

export const updateUserPassword = TryCatch(async (req, res, next) => {
  const {userId, password, newPassword} = req.body as UpdateUserPasswordType;

  if(!userId || !password || !newPassword){
    return next(new ErrorHandler("Something is missing", 404));
  }

  const user = await User.findById(userId);
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if(!isPasswordMatched){
    return next(new ErrorHandler("Old Password is incorrect", 401));
  }

  if(password === newPassword){
    return next(new ErrorHandler("Old Password is incorrect", 401));
  }

  user.password = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUND!));
  await user.save();

  const ntfData = {
    message: "Your password has been changed successfully",
    type: "other",
    userId
  }
  await Notification.create(ntfData);
  await redis.del(`userNotifications-${userId}`);
  
  return res.status(200).json({
    success: true,
    message: "Password changed"
  });
});