import express, { Router } from "express";
import {
  fetchUserProfile,
  fetchUserAddresses,
  fetchUserGiftCards,
  fetchUserSavedCards,
  fetchUserWallets,
  fetchUserCoupons,
  fetchUserRatingAndReviews,
  fetchUserNotifications,
  fetchUserWishlist,
  fetchUserReferralDashboard,
  addUserAddress,
  addGiftCard,
  addUserCard,
  addUserReview,
  addUserWishlist,
  editUser,
} from "../controllers/userController.js";

const router: Router = express.Router();

router
  .get("/:userId", fetchUserProfile)
  .patch("/edit", editUser)
  .get("/addresses", fetchUserAddresses)
  .post("/address", addUserAddress)
  .get("/giftcards", fetchUserGiftCards)
  .post("/giftcards", addGiftCard) // TODO: Implementation is requried.
  .get("/cards", fetchUserSavedCards)
  .post("/card", addUserCard)
  .get("/wallets", fetchUserWallets)
  .get("/coupons", fetchUserCoupons)
  .get("/reviews", fetchUserRatingAndReviews)
  .post("/reviews", addUserReview)
  .get("/notifications", fetchUserNotifications)
  .get("/wishlist", fetchUserWishlist)
  .post("/wishlist", addUserWishlist)
  .get("/referral-dashboard", fetchUserReferralDashboard);

export default router;
