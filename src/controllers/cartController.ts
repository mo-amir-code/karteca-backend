import { TryCatch } from "../middlewares/error.js";
import Cart from "../models/Cart.js";
import ErrorHandler from "../utils/utility-class.js";

export const getCartItemsByUserId = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("UserId is not found.", 404));
  }

  const carts = await Cart.find({ userId }).populate("product");

  return res.status(200).json({
    success: true,
    data: carts,
  });
});

export const createCart = TryCatch(async (req, res, next) => {
  const { userId, product, quantity, currentPrice, totalAmount } = req.body;

  if (!userId || !product || !quantity || !currentPrice || !totalAmount) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  await Cart.create(req.body);

  return res.status(200).json({
    success: true,
    message: "Item added to the cart",
  });
});

export const deleteCart = TryCatch(async (req, res, next) => {
    const { cartId } = req.params;

    if (!cartId) {
      return next(new ErrorHandler("CartId is not found.", 404));
    }

    await Cart.findByIdAndDelete(cartId);

    return res.status(200).json({
      success: true,
      message: "Item removed from the cart.",
    });
});

export const updateCart = TryCatch(async (req, res, next) => {
        const { cartId } = req.body;

        if (!cartId) {
            return next(new ErrorHandler("CartId is missing.", 404));
        }

        await Cart.findByIdAndUpdate(cartId, req.body);

        return res.status(200).json({
            success: true,
            message: "Cart Item updated."
        });
});