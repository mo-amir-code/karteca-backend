import { Types } from "mongoose";
import { TryCatch } from "../middlewares/error.js";
import Cart from "../models/Cart.js";
import ReferMember from "../models/ReferMember.js";
import ReferralLevel from "../models/ReferralLevel.js";
import Transaction from "../models/Transaction.js";
import { VerifyPaymentBodyType } from "../types/payment.js";
import { calculateSHA256 } from "../utils/services.js";
import ErrorHandler from "../utils/utility-class.js";
import { redis } from "../utils/Redis.js";
import User from "../models/User.js";

export const verifyPayment = TryCatch(async (req, res, next) => {
    const {orderId, paymentId, signature, transactionId, isFrom} = req.body as VerifyPaymentBodyType;

    if(!orderId || !paymentId || !signature || !transactionId){
        return next(new ErrorHandler("Something is missing", 404));
    }

    const token = orderId + "|" + paymentId;

    const expectedSignature = calculateSHA256(token.toString());
    const isAutheticated = expectedSignature == signature;

    // updating user transaction
    const transaction = await Transaction.findByIdAndUpdate(transactionId, { status: "processing" });
    
    if(isAutheticated && transaction){
        const mainUserId = new Types.ObjectId(transaction.userId.toString());

        // updating user transaction from procssing to success
        transaction.status = "success";
        transaction.paymentId = paymentId;
        transaction.paymentOrderId = orderId;
        transaction.paymentSignature = signature;
        await transaction.save();
        // ENd with update
        

        if(isFrom === "refer"){
            let level = 1;
            const currentReferMemberMainUser = await ReferMember.findOne({ userId: mainUserId });
            currentReferMemberMainUser.withdrawalPermission = true;

            const mainUserInfo = await User.findById(currentReferMemberMainUser.userId);
            mainUserInfo.coinBalance += transaction.amount;

            await currentReferMemberMainUser.save();
            await mainUserInfo.save();



            let currentReferMember = await ReferMember.findOne({ referCode:currentReferMemberMainUser.referredUserReferCode });

            while(currentReferMember && level <= 7){
                let earning = Math.floor(getLevelWiseMoney(level, transaction.amount));
                currentReferMember.currentReferralEarning += earning;
                currentReferMember.totalReferralEarning += earning;
                await currentReferMember.save();

                const currentMemberLevel = await ReferralLevel.findOne({ level: level, userId: currentReferMember.userId });
                if(currentMemberLevel){                    
                    currentMemberLevel.users.push({earning:earning, isWithdrawalEnabled:true, user: mainUserId});
                    await currentMemberLevel.save();
                }else {
                    await ReferralLevel.create({ level:level, userId:currentReferMember.userId, users:[{ earning:earning, isWithdrawalEnabled: true, user: mainUserId }] });
                }

                await redis.del(`userReferDashboard-${currentReferMember.userId}`);

                level += 1;
                currentReferMember = await ReferMember.findOne({ referCode: currentReferMember.referredUserReferCode });
            }
            
            await redis.del(`userReferDashboard-${transaction.userId}`);

            return res.status(200).json({
                success: true,
                message: "Withdrawal activated"
            });

        }else await Cart.deleteMany({userId: transaction?.userId});

        return res.status(200).json({
            success: true,
            message: "Payment recieved."
        });
    }

    next(new ErrorHandler("Something went wrong", 400));
});

const getLevelWiseMoney = (level:number, amount:number) => {
    switch(level){
        case 1:
            return amount * 0.30;
        case 2:
            return amount * 0.15;
        case 3:
            return amount * 0.07;
        case 4:
            return amount * 0.04;
        case 5:
            return amount * 0.02;
        case 6:
            return amount * 0.01;
        case 7:
            return amount * 0.01;
        default: 
        return 0
    }

}