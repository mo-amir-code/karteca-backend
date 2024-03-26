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
  deleteUserAddress,
  updateUserAddress,
  fetchUserWishlistItems,
  createUserWishlistItems,
  deleteUserWishlistItems,
} from "../controllers/userController.js";

const router: Router = express.Router();

router
  .get("/:userId", fetchUserProfile)
  .patch("/edit", editUser)
  .get("/addresses/:userId", fetchUserAddresses)
  .post("/address", addUserAddress)
  .delete("/address", deleteUserAddress)
  .patch("/address", updateUserAddress)
  .get("/giftcards", fetchUserGiftCards)
  .post("/giftcards", addGiftCard) // TODO: Implementation is requried.
  .get("/cards", fetchUserSavedCards)
  .post("/card", addUserCard)
  .get("/wallets", fetchUserWallets)
  .get("/coupons", fetchUserCoupons)
  .get("/reviews", fetchUserRatingAndReviews)
  .post("/reviews", addUserReview)
  .get("/notifications", fetchUserNotifications)
  .get("/wishlist/:userId", fetchUserWishlist)
  .get("/wishlist/items/:userId", fetchUserWishlistItems)
  .post("/wishlist/items", createUserWishlistItems)
  .delete("/wishlist/items", deleteUserWishlistItems)
  .post("/wishlist", addUserWishlist)
  .get("/referral-dashboard", fetchUserReferralDashboard);

export default router;
