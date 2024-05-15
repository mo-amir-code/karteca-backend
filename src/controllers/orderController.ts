import { TryCatch } from "../middlewares/error.js";
import Order from "../models/Order.js";
import { CPaymentOrderType, CTransactionType } from "../types/user.js";
import ErrorHandler from "../utils/utility-class.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { redis } from "../utils/Redis.js";
// import Cart from "../models/Cart.js";
import { makePayment } from "../middlewares/payment.js";
import ReferMember from "../models/ReferMember.js";
import { clearCreateOrderCachedRedis, returnWalletAmount } from "../utils/services.js";

export const fetchUserOrder = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 400));
  }

  const catchedOrders = await redis?.get(`userOrders-${userId}`);

  if(catchedOrders){
    return res.status(200).json({
      success: true,
      message: "User orders fetched.",
      data: JSON.parse(catchedOrders),
    });
  }

  let orders = await Order.find({ userId }).populate({
    path: "product",
    select: "title thumbnail"
  });

  orders = orders.map((order) => {
    const newOrder = JSON.parse(JSON.stringify(order));
    return {
      ...newOrder,
      product:{
        ...newOrder.product,
        thumbnail: newOrder.product.thumbnail.url
      }
    }
  });

  await redis?.set(`userOrders-${userId}`, JSON.stringify(orders));

  return res.status(200).json({
    success: true,
    message: "User orders fetched.",
    data: orders.reverse()
  });
}); // redis done

export const fetchUserOrderById = TryCatch(async (req, res, next) => {
  const { orderId } = req.params;

  if (!orderId) {
    return next(new ErrorHandler("Something is missing", 400));
  }

  const cachedOrderDetails = await redis?.get(`userOrderDetails-${orderId}`);

  if(cachedOrderDetails){
    return res.status(200).json({
      success: true,
      message: "User order fetched.",
      data: JSON.parse(cachedOrderDetails)
    });
  }

  let order = await Order.findById(orderId).select(" -color -refund -userId -createdAt").populate([
    {
      path: "product",
      select: "_id title thumbnail description",
    },
    {
      path: "deliveryAddress",
      select: "-_id -userId -country -type",
    },
    {
      path: "transaction",
      select: "status amount -_id",
    },
  ]);

  const newOrder = JSON.parse(JSON.stringify(order));

  order = {
    ...newOrder,
    product:{
      ...newOrder.product,
      thumbnail: newOrder.product.thumbnail.url
    }
  }

  await redis?.set(`userOrderDetails-${orderId}`, JSON.stringify(order));

  return res.status(200).json({
    success: true,
    message: "User order fetched.",
    data: order,
  });
}); // redis done

export const createOrders = TryCatch(async (req, res, next) => {
  const {orders, paymentMode, userId, wallet} = req.body as {paymentMode: "online" | "cash" , orders:[CPaymentOrderType], userId:string, wallet?:{name:string, amount:number}};

  if (!(orders.length > 0)) {
    return next(new ErrorHandler("Orders are missing.", 400));
  }

  if(!orders[0].deliveryAddress){
    return next(new ErrorHandler("Delivery address is required", 400));
  }

  let totalAmount: number = orders.reduce(
    (total: number, current: CPaymentOrderType) => {
      return total + current.totalAmount;
    },
    0
  );

  const {email, coinBalance, mainBalance} = await User.findById(userId).select("email coinBalance mainBalance");
  const { currentReferralEarning } = await ReferMember.findOne({ userId:userId })

  if(wallet){
    switch(wallet?.name){
      case "mainBalance":
        if(mainBalance < wallet.amount) return next(new ErrorHandler("Something went wrong!", 400));
        break;
      case "coinBalance":
        if(coinBalance < wallet.amount) return next(new ErrorHandler("Something went wrong!", 400));
        break;
      case "currentReferralEarning":
        if(currentReferralEarning < wallet.amount) return next(new ErrorHandler("Something went wrong!", 400));
        break;
    }
  }


  const txnData: CTransactionType = {
    userId: userId,
    type: "spend",
    mode: "shopping",
    amount: totalAmount,
    wallet
  };

  if(wallet?.name === "coinBalance"){
    const coinBalanceAmount = returnWalletAmount({totalAmount:totalAmount, amount:wallet.amount, name:wallet.name});
    txnData.wallet!.amount = coinBalanceAmount;
    totalAmount -= coinBalanceAmount
  }

  const newTransaction = await Transaction.create(txnData);

  const newOrders = orders.map((order) => {
    return {
      ...order,
      transaction: newTransaction._id,
      userId,
      paymentMode
    };
  });

  await Order.create(newOrders);

  if(paymentMode === "cash"){
    return res.status(200).json({
      success: true,
      message: "Order placed",
      paymentMode: paymentMode
    })
  }

  if(totalAmount <= (wallet?.amount || 0) && wallet?.name !== "coinBalance"){
    newTransaction.status = "success";
    await newTransaction.save();
    switch (wallet?.name) {
      case "mainBalance":
        const user = await User.findById(userId);
        user.mainBalance -= totalAmount < wallet.amount? totalAmount : wallet?.amount;
        await user.save();
        break;
      case "currentReferralEarning":
        await redis?.del(`userReferDashboard-${userId}`);
        await redis?.del(`userReferShortDashboard-${userId}`);
        const referMember = await ReferMember.findOne({
          userId: userId,
        });
        referMember.currentReferralEarning -= totalAmount < wallet.amount? totalAmount : wallet?.amount;
        await referMember.save();
        break;
      default:
        null;
    }

    return res.status(200).json({
      success: true,
      message: "Order placed",
      paymentMode: "wallet"
    })
  }

  if(wallet && wallet.name !== "coinBalance") totalAmount -= wallet.amount;

  const paymentQrCodeUrl = await makePayment({totalAmount, email});
  newTransaction.paymentQrCodeUrl = paymentQrCodeUrl;
  await newTransaction.save();

  await clearCreateOrderCachedRedis({userId})

  return res.status(200).json({
    success: true,
    message: "Order created",
    paymentMode: paymentMode,
    data: {
      paymentQrCodeUrl,
      totalAmount,
      transactionId: newTransaction._id
    }
  });
}); // redis done