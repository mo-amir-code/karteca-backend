import { TryCatch } from "../middlewares/error.js";
import Cart from "../models/Cart.js";
import Transaction from "../models/Transaction.js";
import { VerifyPaymentBodyType } from "../types/payment.js";
import { calculateSHA256 } from "../utils/services.js";
import ErrorHandler from "../utils/utility-class.js";

export const verifyPayment = TryCatch(async (req, res, next) => {
    const {orderId, paymentId, signature, transactionId} = req.body as VerifyPaymentBodyType;

    if(!orderId || !paymentId || !signature || !transactionId){
        return next(new ErrorHandler("Something is missing", 404));
    }

    const token = orderId + "|" + paymentId;

    const expectedSignature = calculateSHA256(token.toString());
    const isAutheticated = expectedSignature == signature;

    if(isAutheticated){
        const updatedValues = {
            status: "success",
            paymentId: paymentId,
            paymentOrderId: orderId,
            paymentSignature: signature
        }


        const transaction = await Transaction.findByIdAndUpdate(transactionId, updatedValues).select("userId");

        await Cart.deleteMany({userId: transaction?.userId});

        return res.status(200).json({
            success: true,
            message: "Payment recieved."
        });
    }

    next(new ErrorHandler("Something went wrong", 400));
});