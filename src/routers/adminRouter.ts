import express, { Router } from "express";
import { fetchTransactionRequests } from "../controllers/adminController.js";

const router: Router = express.Router();

router
   .get("/transaction/requests", fetchTransactionRequests)
   

export default router;