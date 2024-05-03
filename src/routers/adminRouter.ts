import express, { Router } from "express";
import { fetchTransactionRequests, fetchUserCount, fetchWithdrawalRequests } from "../controllers/adminController.js";

const router: Router = express.Router();

router
   .get("/transaction/requests", fetchTransactionRequests)
   .get("/withdrawal/requests", fetchWithdrawalRequests)
   .get("/user/count", fetchUserCount)
   

export default router;