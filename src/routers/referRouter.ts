import express, { Router } from "express"
import { fetchUserDashboard, userReferralEarning } from "../controllers/referController.js";

const router:Router = express.Router();

router
  .get("/earning/:userId", userReferralEarning)
  .get("/dashboard/:userId", fetchUserDashboard)


export default router;