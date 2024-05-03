import { TryCatch } from "../middlewares/error.js";
import TxnVerifyRequest from "../models/TxnVerifyRequest.js";
import User from "../models/User.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";


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
            status: txn.status,
            type: txn.type
        }
    });



    return res.status(200).json({
        success: true,
        message: "Transaction requests fetched",
        data: txns
    });

});

export const fetchWithdrawalRequests = TryCatch( async (req, res, next) => {

    let withdrawalRequests = await WithdrawalRequest.find({ status: { $in: ["pending", "processing"] } }).populate({
        path: "userId",
        select: "name phone"
    });


    withdrawalRequests = withdrawalRequests.map((wtwl) => {
        return {
            _id: wtwl?._id,
            name: wtwl?.userId.name,
            amount: wtwl?.amount,
            phone: wtwl?.userId?.phone,
            upiId: wtwl?.to?.upi,
            status: wtwl?.status
        }
    });



    return res.status(200).json({
        success: true,
        message: "Withdrawal requests fetched",
        data: withdrawalRequests
    });

});

export const fetchUserCount = TryCatch(async (req, res, next) => {

    const count = await User.countDocuments();

    return res.status(200).json({
        success: true,
        message: "User counts seccessfully",
        data: count
    })

});