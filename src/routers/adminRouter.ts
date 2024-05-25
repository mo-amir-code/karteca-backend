import express, { Router } from "express";
import { activeUpi, createAdmin, createCategory, createChildCategory, createProduct, deleteImage, fetchProductCategory, fetchTransactionRequests, fetchUserCount, fetchWithdrawalRequests, flushRedis, getAdminUpis, uploadImage } from "../controllers/adminController.js";
import multer from "multer"


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router: Router = express.Router();

router
   .get("/transaction/requests", fetchTransactionRequests)
   .get("/withdrawal/requests", fetchWithdrawalRequests)
   .get("/user/count", fetchUserCount)
   .get("/product/categories", fetchProductCategory)
   .get("/redis/flush", flushRedis)
   .get("/upi", getAdminUpis)
   .post("/product", createProduct)
   .post("/product/image/upload", uploadImage)
   .delete("/product/image", deleteImage)
   .post("/category", createCategory)
   .post("/child/category", createChildCategory)
   .patch("/create", createAdmin)
   .patch("/upi/active", activeUpi)
   

export default router;