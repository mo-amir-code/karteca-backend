import express, { Router } from "express"
import { addMoney, fetchUserDashboard, fetchUserShortDashboard, userReferralEarning } from "../controllers/referController.js";

const router:Router = express.Router();

router
  .get("/earning/:userId", userReferralEarning)
  .get("/dashboard/:userId", fetchUserDashboard)
  .get("/short-dashboard/:userId", fetchUserShortDashboard)
  .post("/addmoney", addMoney)


export default router;