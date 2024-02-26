import { TryCatch } from "../middlewares/error.js";
import Order from "../models/Order.js";
import { CPaymentOrderType, CTransactionType } from "../types/user.js";
import ErrorHandler from "../utils/utility-class.js";
import Transaction from "../models/Transaction.js";

export const fetchUserOrder = TryCatch(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new ErrorHandler("Something is missing here.", 404));
  }

  const orders = await Order.find({ userId }).populate({
    path: "product",
    select: "title thumbnail",
  });

  return res.status(200).json({
    success: true,
    message: "User orders fetched.",
    data: orders,
  });
});

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
  const odrs = req.body as [CPaymentOrderType];

  if (!(odrs.length > 0)) {
    return next(new ErrorHandler("Orders are missing.", 404));
  }

  const totalAmount: number = odrs.reduce(
    (total: number, current: CPaymentOrderType) => {
      return total + current.totalAmount;
    },
    0
  );

  const userId = odrs[0].userId;

  const txnData: CTransactionType = {
    userId: userId,
    type: "spend",
    mode: "shopping",
    amount: totalAmount,
  };

  const newTransaction = await Transaction.create(txnData);

  const newOrders = odrs.map((order) => {
    return {
      ...order,
      transaction: newTransaction._id,
    };
  });

  await Order.create(newOrders);

  // req.body = {
  //   transactionId: newTransaction._id,
  //   userId,
  //   amount: totalAmount,
  //   redirectPath: "/order/payment/status",
  //   mobileNumber: odrs[0].mobileNumber || 9999999999,
  // };

  // next();

  return res.status(200).json({
    success: true,
    message: "Order created successfully."
  });
});
