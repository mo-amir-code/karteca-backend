import express, { Router } from "express";
import { getUserNotifications } from "../controllers/notificationController.js";

const router:Router = express.Router();

router
    .get("/:userId", getUserNotifications)


export default router;