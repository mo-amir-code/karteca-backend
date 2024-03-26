import express, { Router } from "express";
import { getCartItemsByUserId, createCart, deleteCart, updateCart, getCartCountByUserId } from "../controllers/cartController.js";

const router: Router = express.Router();

router
   .get("/:userId", getCartItemsByUserId)
   .get("/count/:userId", getCartCountByUserId)
   .post("/", createCart)
   .delete("/:cartId", deleteCart)
   .patch("/", updateCart);
   

export default router;