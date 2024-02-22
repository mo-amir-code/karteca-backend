import express, { Router } from "express";
import { getAllProducts, getBanners, getProductById } from "../controllers/productController.js";

const router: Router = express.Router();

router
   .get("/all", getAllProducts)
   .get("/:productId", getProductById)
   .get("/banner", getBanners)

export default router;