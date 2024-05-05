import express, { Router } from "express";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import productRouter from "./productRouter.js";
import cartRouter from "./cartRouter.js";
import orderRouter from "./orderRouter.js";
import paymentRouter from "./paymentRouter.js";
import referRouter from "./referRouter.js";
import notificationsRouter from "./notificationRouter.js";
import bannerRouter from "./bannerRouter.js";
import adminRouter from "./adminRouter.js";
import { isValidRequest } from "../middlewares/middlewars.js";

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use("/user", isValidRequest, userRouter);
router.use("/banner", bannerRouter);
router.use("/product", productRouter);
router.use("/cart", cartRouter);
router.use("/order", orderRouter);
router.use("/payment", paymentRouter);
router.use("/refer", isValidRequest, referRouter);
router.use("/notification", isValidRequest, notificationsRouter);
router.use("/admin", isValidRequest, adminRouter);

export default router;
