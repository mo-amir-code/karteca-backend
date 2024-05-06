import express, { Router } from "express"
import { cancelPayment, createSubscription, verifyPayment, verifyPaymentRequest, withdrawalRequest, withdrawalRequestVerification } from "../controllers/paymentController.js";
import { isAdminValidRequest, isValidRequest } from "../middlewares/middlewars.js";

const router: Router = express.Router()

router
   .post("/verify", isAdminValidRequest, verifyPayment)
   .post("/verify-request", isValidRequest, verifyPaymentRequest)
   .patch("/cancel", isValidRequest, cancelPayment)
   .post("/subscription", isValidRequest, createSubscription)
   .post("/withdrawal", isValidRequest, withdrawalRequest)
   .patch("/withdrawal/verify", isAdminValidRequest, withdrawalRequestVerification)

export default router;