import express, { Router } from "express";
import { getCartItemsByUserId, createCart, deleteCart, updateCart } from "../controllers/cartController.js";

const router: Router = express.Router();

router
   .get("/:userId", getCartItemsByUserId)
   .post("/", createCart)
   .delete("/:cartId", deleteCart)
   .patch("/", updateCart);
   

export default router;