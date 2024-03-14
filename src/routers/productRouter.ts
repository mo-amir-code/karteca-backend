import express, { Router } from "express";
import { createProduct, getBanners, getComboProducts, getLatestProducts, getProductById, getTopProducts } from "../controllers/productController.js";

const router: Router = express.Router();

router
   .get("/top", getTopProducts)
   .get("/latest", getLatestProducts)
   .get("/combos", getComboProducts)
   .get("/:productId", getProductById)
   .get("/banner", getBanners)
   .post("/", createProduct)

export default router;