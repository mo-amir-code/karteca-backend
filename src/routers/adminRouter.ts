import express, { Router } from "express";
import { createCategory, createProduct, deleteImage, fetchProductCategory, fetchTransactionRequests, fetchUserCount, fetchWithdrawalRequests, uploadImage } from "../controllers/adminController.js";
import multer from "multer"


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router: Router = express.Router();

router
   .get("/transaction/requests", fetchTransactionRequests)
   .get("/withdrawal/requests", fetchWithdrawalRequests)
   .get("/user/count", fetchUserCount)
   .get("/product/categories", fetchProductCategory)
   .post("/product", createProduct)
   .post("/product/image/upload", uploadImage)
   .delete("/product/image", deleteImage)
   .post("/category", createCategory)
   

export default router;