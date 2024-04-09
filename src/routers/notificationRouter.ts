import express, { Router } from "express";
import { getUserNotifications, readUserNotifications } from "../controllers/notificationController.js";

const router:Router = express.Router();

router
    .get("/:userId", getUserNotifications)
    .patch("/read/:userId", readUserNotifications)


export default router;