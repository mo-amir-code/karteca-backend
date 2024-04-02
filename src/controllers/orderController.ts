import { TryCatch } from "../middlewares/error.js";
import Order from "../models/Order.js";
import { CPaymentOrderType, CTransactionType } from "../types/user.js";
import ErrorHandler from "../utils/utility-class.js";
import Transaction from "../models/Transaction.js";
import razorpayInstance from "../utils/razorpay.js";
import User from "../models/User.js";
import { redis } from "../utils/Redis.js";

export const fetchUserOrder = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const catchedOrders = await redis.get(`userOrders-${userId}`);

  if(catchedOrders){
    return res.status(200).json({
      success: true,
      message: "User orders fetched.",
      data: JSON.parse(catchedOrders),
    });
  }

  const orders = await Order.find({ userId }).populate({
    path: "product",
    select: "title thumbnail",
  });

  await redis.set(`userOrders-${userId}`, JSON.stringify(orders));

  return res.status(200).json({
    success: true,
    message: "User orders fetched.",
    data: orders
  });
}); // redis done

export const fetchUserOrderById = TryCatch(async (req, res, next) => {
  const { orderId } = req.params;

  if (!orderId) {
    res.status(400).json({
      status: "failed",
      message: "Something missing.",
    });
    return;
  }

  const order = await Order.findById(orderId).populate([
    {
      path: "product",
      select: "title thumbnail",
    },
    {
      path: "deliveryAddress",
      select: "-userId",
    },
  ]);

  return res.status(200).json({
    success: true,
    message: "User order fetched.",
    data: order,
  });
});

export const createOrders = TryCatch(async (req, res, next) => {
  const {orders, paymentMode, userId} = req.body as {paymentMode: "online" | "cash" , orders:[CPaymentOrderType], userId:string};

  if (!(orders.length > 0)) {
    return next(new ErrorHandler("Orders are missing.", 404));
  }

  const totalAmount: number = orders.reduce(
    (total: number, current: CPaymentOrderType) => {
      return total + current.totalAmount;
    },
    0
  );

  const txnData: CTransactionType = {
    userId: userId,
    type: "spend",
    mode: "shopping",
    amount: totalAmount,
  };

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
  await redis.del(`userOrders-${userId}`);

  const user = await User.findById(userId).select("name email phone");

  const paymentOrder = await razorpayInstance.orders.create({
    amount: totalAmount * 100,
    currency: "INR",
    receipt: newTransaction._id,
  });

  return res.status(200).json({
    success: true,
    message: "Order created successfully.",
    data: {
      key: process.env.RAZORPAY_KEY_ID,
      name: process.env.COMPANY_NAME,
      currency: "INR",
      amount: totalAmount * 100,
      orderId: paymentOrder.id,
      prefill:{
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      theme: {
        color: process.env.PRIMARY_COLOR
      },
      transactionId: newTransaction._id
    }
  });
}); // redis done