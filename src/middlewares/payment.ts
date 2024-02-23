import axios from "axios";
import { TryCatch } from "./error.js";
import Transaction from "../models/Transaction.js";
import { calculateSHA256, makePayment } from "../utils/services.js";
import ErrorHandler from "../utils/utility-class.js";

export const orderCheckout = TryCatch( async (req, res, next) => {
    const {transactionId, userId, amount, redirectPath, mobileNumber} = req.body;

    const redirectUrl = await makePayment({transactionId, userId, amount, redirectPath, mobileNumber});
    return res.status(200).json({
        success: true,
        message: "Payment order created.",
        data: {
            redirectUrl
        }
    })
});

export const orderPaymentStatus = TryCatch( async (req, res, next) => {
    const {transactionId, merchantId} = req.body;
    
    const transaction = await Transaction.findByIdAndUpdate(transactionId, {status: "processing"}, {new: true});

    if(!transactionId){
        return next(new ErrorHandler("Transaction Id is missing.", 404));
    }

    const fullUrl = `/pg/v1/status/${merchantId}/${transactionId}${process.env.PHONEPE_SALT_KEY}`
    const dataSha256 = calculateSHA256(fullUrl);

    const checksum = dataSha256 + "###" + process.env.PHONEPE_SALT_INDEX;

    const options = {
        method: "GET",
        url: `${process.env.PHONEPE_UAT_PAY_API_URL}/status/${merchantId}/${transactionId}`,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": `${merchantId}`,
        },
      };

    const response = await axios.request(options);


    if(response.data.code === "PAYMENT_SUCCESS"){
        transaction?.status === "success";
        await transaction?.save();
        return res.status(200).redirect(`${process.env.CLIENT_ORIGIN}/payment/success`) 
    }
    
    return res.status(400).redirect(`${process.env.CLIENT_ORIGIN}/payment/failed`) 
});