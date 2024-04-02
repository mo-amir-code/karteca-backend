import express, { Router } from "express";
import { createOrders, fetchUserOrder, fetchUserOrderById } from "../controllers/orderController.js";
// import { orderCheckout, orderPaymentStatus } from "../middlewares/payment.js";

const router: Router = express.Router();

router
   .get("/:userId", fetchUserOrder)
   .get("/:orderId", fetchUserOrderById)
   .post("/", createOrders)

export default router;