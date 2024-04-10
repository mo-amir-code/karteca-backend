import express, { Router } from "express";
import { createProduct, getBanners, getCategories, getCategoriesWithImage, getComboProducts, getLatestProducts, getProductById, getTopProducts, searchProduct } from "../controllers/productController.js";

const router: Router = express.Router();

router
   .get("/top", getTopProducts)
   .get("/latest", getLatestProducts)
   .get("/search", searchProduct)
   .get("/combos", getComboProducts)
   .get("/categories", getCategories)
   .get("/image/categories", getCategoriesWithImage)
   .get("/:productId", getProductById)
   .get("/banner", getBanners)
   .post("/", createProduct)

export default router;