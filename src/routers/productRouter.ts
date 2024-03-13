import express, { Router } from "express";
import { createProduct, getBanners, getProductById, getTopProducts } from "../controllers/productController.js";

const router: Router = express.Router();

router
   .get("/top", getTopProducts)
   .get("/:productId", getProductById)
   .get("/banner", getBanners)
   .post("/", createProduct)

export default router;