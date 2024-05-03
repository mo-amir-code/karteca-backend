import { TryCatch } from "../middlewares/error.js";
import TxnVerifyRequest from "../models/TxnVerifyRequest.js";


export const fetchTransactionRequests = TryCatch( async (req, res, next) => {

    let txns = await TxnVerifyRequest.find({ status: { $in: ["pending", "processing"] } }).populate({
        path: "userId",
        select: "name phone"
    });


    txns = txns.map((txn) => {
        return {
            _id: txn._id,
            name: txn.userId.name,
            amount: txn.amount,
            phone: txn.userId.phone,
            utrId: txn.utrId,
            status: txn.status
        }
    });



    return res.status(200).json({
        success: true,
        message: "All requested transactions fetched",
        data: txns
    });

});