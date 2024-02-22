import { TryCatch } from '../middlewares/error.js';
import Order from '../models/Order.js';
import ErrorHandler from '../utils/utility-class.js';

export const fetchUserOrder = TryCatch(async (req, res, next) => {
        const { userId } = req.query;

        if (!userId) {
            return next(new ErrorHandler("Something is missing here.", 404));
        }

        const orders = await Order.find({ userId }).populate({
            path: "product",
            select: "title thumbnail"
        });

        return res.status(200).json({
            success: true,
            message: "User orders fetched.",
            data: orders
        });
});

export const fetchUserOrderById = TryCatch( async (req, res, next) => {
        const { orderId } = req.params;

        if (!orderId) {
            res.status(400).json({
                status: "failed",
                message: "Something missing."
            });
            return;
        }

        const order = await Order.findById(orderId).populate([
            {
                path: "product",
                select: "title thumbnail"
            },
            {
                path: "deliveryAddress",
                select: "-userId"
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "User order fetched.",
            data: order
        });
});