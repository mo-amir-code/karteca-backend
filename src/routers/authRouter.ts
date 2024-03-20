import express, { Router } from "express";
import { forgotPassword, resetPassword, sendOTP, signin, signup, verify } from "../controllers/authController.js";

const router: Router = express.Router();

router.post("/signup", signup, sendOTP);
router.post("/verify", verify);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword, sendOTP);
router.patch("/reset-password", resetPassword);

export default router;