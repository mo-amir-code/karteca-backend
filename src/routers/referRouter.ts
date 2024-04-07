import express, { Router } from "express"
import { addMoney, fetchUserDashboard, userReferralEarning } from "../controllers/referController.js";

const router:Router = express.Router();

router
  .get("/earning/:userId", userReferralEarning)
  .get("/dashboard/:userId", fetchUserDashboard)
  .post("/addmoney", addMoney)


export default router;