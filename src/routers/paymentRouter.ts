import express, { Router } from "express"
import { verifyPayment } from "../controllers/paymentController.js";

const router: Router = express.Router()

router
   .post("/verify", verifyPayment)

export default router;