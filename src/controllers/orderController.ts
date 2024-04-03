import { TryCatch } from "../middlewares/error.js";
import Order from "../models/Order.js";
import { CPaymentOrderType, CTransactionType } from "../types/user.js";
import ErrorHandler from "../utils/utility-class.js";
import Transaction from "../models/Transaction.js";
import razorpayInstance from "../utils/razorpay.js";
import User from "../models/User.js";
import { redis } from "../utils/Redis.js";
import Cart from "../models/Cart.js";

export const fetchUserOrder = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

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
    select: "title thumbnail"
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
    return res.status(400).json({
      status: "failed",
      message: "Something missing.",
    });
  }

  const cachedOrderDetails = await redis.get(`userOrderDetails-${orderId}`);

  if(cachedOrderDetails){
    return res.status(200).json({
      success: true,
      message: "User order fetched.",
      data: JSON.parse(cachedOrderDetails)
    });
  }

  const order = await Order.findById(orderId).select(" -color -refund -userId -createdAt").populate([
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

  await redis.set(`userOrderDetails-${orderId}`, JSON.stringify(order));

  return res.status(200).json({
    success: true,
    message: "User order fetched.",
    data: order,
  });
}); // redis done

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
  await Cart.deleteMany({userId})
  await redis.del(`userOrders-${userId}`);
  await redis.del(`userCartCounts-${userId}`);
  await redis.del(`userCartItem-${userId}`);

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