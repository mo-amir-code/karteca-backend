import express, { Router } from "express";
import { createProduct, getAllProducts, getBanners, getProductById } from "../controllers/productController.js";

const router: Router = express.Router();

router
   .get("/all", getAllProducts)
   .get("/:productId", getProductById)
   .get("/banner", getBanners)
   .post("/", createProduct)

export default router;