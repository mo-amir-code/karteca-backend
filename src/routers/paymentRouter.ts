import express, { Router } from "express"
import { cancelPayment, createSubscription, verifyPayment, verifyPaymentRequest, withdrawalRequest } from "../controllers/paymentController.js";

const router: Router = express.Router()

router
   .post("/verify", verifyPayment)
   .post("/verify-request", verifyPaymentRequest)
   .patch("/cancel", cancelPayment)
   .post("/subscription", createSubscription)
   .post("/withdrawal", withdrawalRequest)

export default router;