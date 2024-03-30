import express, { Router } from "express";
import { createProduct, getBanners, getComboProducts, getLatestProducts, getProductById, getTopProducts, searchProduct } from "../controllers/productController.js";

const router: Router = express.Router();

router
   .get("/top", getTopProducts)
   .get("/latest", getLatestProducts)
   .get("/combos", getComboProducts)
   .get("/:productId", getProductById)
   .get("/banner", getBanners)
   .post("/", createProduct)
   .get("/search", searchProduct)

export default router;