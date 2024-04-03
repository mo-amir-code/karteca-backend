import express, { Router } from "express";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import productRouter from "./productRouter.js";
import cartRouter from "./cartRouter.js";
import orderRouter from "./orderRouter.js";
import paymentRouter from "./paymentRouter.js";
import referRouter from "./referRouter.js";

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/product", productRouter);
router.use("/cart", cartRouter);
router.use("/order", orderRouter);
router.use("/payment", paymentRouter);
router.use("/refer", referRouter);

export default router;
