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

export const fetchUserProfile = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here", 404));
  }

  const user = await User.findById(userId).select("name gender email phone");

  return res.status(200).json({
    success: true,
    message: "User information fetched.",
    data: { ...user },
  });
});

export const fetchUserAddresses = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const addresses = await DeliveryAddress.find({ userId });

  return res.status(200).json({
    success: true,
    message: "User addresses fetched.",
    data: addresses,
  });
});

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

export const fetchUserCoupons = TryCatch(async (req, res, next) => {
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

export const fetchUserWishlist = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const wishlist = await Wishlist.find({ userId }).populate({
    path: "products",
    select: "title thumbnail price discount stock",
  });

  return res.status(200).json({
    success: true,
    message: "User wishlist fetched.",
    data: wishlist,
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
