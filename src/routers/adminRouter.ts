import express, { Router } from "express";
import { activeUpi, createAdmin, createCategory, createProduct, deleteImage, fetchProductCategory, fetchTransactionRequests, fetchUserCount, fetchWithdrawalRequests, getAdminUpis, uploadImage } from "../controllers/adminController.js";
import multer from "multer"


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router: Router = express.Router();

router
   .get("/transaction/requests", fetchTransactionRequests)
   .get("/withdrawal/requests", fetchWithdrawalRequests)
   .get("/user/count", fetchUserCount)
   .get("/product/categories", fetchProductCategory)
   .get("/upi", getAdminUpis)
   .post("/product", createProduct)
   .post("/product/image/upload", uploadImage)
   .delete("/product/image", deleteImage)
   .post("/category", createCategory)
   .patch("/create", createAdmin)
   .patch("/upi/active", activeUpi)
   

export default router;