import express, { Router } from "express"
import { userReferralEarning } from "../controllers/referController.js";

const router:Router = express.Router();

router
  .get("/earning/:userId", userReferralEarning)


export default router;