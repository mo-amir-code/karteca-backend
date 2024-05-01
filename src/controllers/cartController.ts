import { TryCatch } from "../middlewares/error.js";
import Cart from "../models/Cart.js";
import ReferMember from "../models/ReferMember.js";
import User from "../models/User.js";
import { APICartType } from "../types/cart.js";
import { redis } from "../utils/Redis.js";
import ErrorHandler from "../utils/utility-class.js";

export const getCartItemsByUserId = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("UserId is not found.", 400));
  }

  const catchedItems = await redis.get(`userCartItem-${userId}`);

  if(catchedItems){
    return res.status(200).json({
      success: true,
      data: JSON.parse(catchedItems)
    });
  }

  const carts = await Cart.find({ userId }).populate({
    path: "product",
    select: "title thumbnail specifications price"
  }).select("quantity totalAmount currentPrice discount color");

  await redis.set(`userCartItem-${userId}`, JSON.stringify(carts));

  return res.status(200).json({
    success: true,
    data: carts,
  });
}); // redis done

export const getCartCountByUserId = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("UserId is not found.", 400));
  }

  const catchedCartCounts = await redis.get(`userCartCounts-${userId}`);

  if(catchedCartCounts){
    return res.status(200).json({
      success: true,
      data: JSON.parse(catchedCartCounts),
    });
  }

  const cartsId = await Cart.find({ userId }).select("product");
  const totalItems = cartsId.map((it) => it.product);

  await redis.set(`userCartCounts-${userId}`, JSON.stringify(totalItems));

  return res.status(200).json({
    success: true,
    data: totalItems,
  });
}); // redis done

export const getWallets = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("UserId is not found.", 400));
  }

  const catchedCheckoutWallets = await redis.get(`userCheckoutWallets-${userId}`);

  if(catchedCheckoutWallets){
    return res.status(200).json({
      success: true,
      data: JSON.parse(catchedCheckoutWallets),
    });
  }

  const user = await User.findById(userId);
  const userReferMember = await ReferMember.findOne({ userId: userId });  

  const data = {
    mainBalance: user.mainBalance,
    coinBalance: user.coinBalance,
    currentReferralEarning: userReferMember.currentReferralEarning
  }

  await redis.set(`userCheckoutWallets-${userId}`, JSON.stringify(data));

  return res.status(200).json({
    success: true,
    data: data
  });
}); // redis done

export const createCart = TryCatch(async (req, res, next) => {
  const { userId, product, quantity, currentPrice, totalAmount } = req.body as APICartType;

  
  if (!userId || !product || !quantity || !currentPrice || !totalAmount) {
    return next(new ErrorHandler("Something is missing here.", 400));
  }

  const isAlreadyInCart = await Cart.findOne({$and: [{userId: userId}, {product: product}]});
  
  if(isAlreadyInCart){
    return next(new ErrorHandler("Item is already in cart", 409));
  }

  await Cart.create(req.body);
  await redis.del(`userCartItem-${userId}`);
  await redis.del(`userCartCounts-${userId}`);

  return res.status(200).json({
    success: true,
    message: "Item added to cart",
  });
}); // redis done

export const deleteCart = TryCatch(async (req, res, next) => {
    const { cartId } = req.params;

    if (!cartId) {
      return next(new ErrorHandler("CartId is not found.", 400));
    }

    const cart = await Cart.findByIdAndDelete(cartId);
    await redis.del(`userCartItem-${cart.userId}`);
    await redis.del(`userCartCounts-${cart.userId}`);

    return res.status(200).json({
      success: true,
      message: "Item removed from the cart.",
    });
}); // redis done

export const updateCart = TryCatch(async (req, res, next) => {
        const { cartId } = req.body;

        if (!cartId) {
            return next(new ErrorHandler("CartId is missing.", 400));
        }

        const cart = await Cart.findByIdAndUpdate(cartId, req.body);
        await redis.del(`userCartItem-${cart.userId}`);

        return res.status(200).json({
            success: true,
            message: "Cart Item updated."
        });
}); // redis done