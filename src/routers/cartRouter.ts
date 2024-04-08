import express, { Router } from "express";
import { getCartItemsByUserId, createCart, deleteCart, updateCart, getCartCountByUserId, getWallets } from "../controllers/cartController.js";

const router: Router = express.Router();

router
   .get("/:userId", getCartItemsByUserId)
   .get("/count/:userId", getCartCountByUserId)
   .get("/wallets/:userId", getWallets)
   .post("/", createCart)
   .delete("/:cartId", deleteCart)
   .patch("/", updateCart);
   

export default router;