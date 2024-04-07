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
        const mainUserId = transaction.userId;

        // updating user transaction from procssing to success
        transaction.status = "success";
        transaction.paymentId = paymentId;
        transaction.paymentOrderId = orderId;
        transaction.paymentSignature = signature;
        await transaction.save();
        // ENd with update
        

        if(isFrom === "refer"){
            let level = 1;
            // fecthing user from refer memeber schema
            let user = await ReferMember.findOne({ userId: mainUserId });
            user.withdrawalPermission = true;
            await user.save();

            while(user?.referredUserReferCode){
                const referCode = user.referredUserReferCode;
                const earning = getLevelWiseMoney(level, transaction.amount);
                if(level <= 7){
                    // UPdating level wise bottom to top referral earning
                    const currentUser = await ReferMember.findOne({ referredUserReferCode:referCode });
                    currentUser.currentReferralEarning += earning;
                    currentUser.totalReferralEarning += earning;
                    await currentUser.save();
                    // End with update

                    // updating current user level
                    const currentReferralUser = await ReferralLevel.findOneAndUpdate({ level, userId:currentUser.userId });
                    if(currentReferralUser){
                        const index = currentReferralUser.users.findIndex((item) => item.user.equals(mainUserId.toString()));
                        const currentUser = currentReferralUser.users.find((item) => item.user.equals(mainUserId.toString()));
                        if(index !== -1 && currentUser){
                            currentUser.earning += earning;
                            currentUser.isWithdrawalEnabled = true;
                            currentReferralUser.users[index] = currentUser;
                            await currentReferralUser.save();
                        }
                        // else{
                        //     currentReferralUser.users.push({ user: mainUserId, isWithdrawalEnabled: true, earning });
                        //     await currentReferralUser.save();
                        // }
                    }else{
                        await ReferralLevel.create({ level, userId: currentUser.userId, users: [{ earning, isWithdrawalEnabled: true, user: mainUserId }] })
                    }

                    // fetching parent connection of current user and assigning in user
                    user = await ReferMember.findOne({referredUserReferCode:currentUser.referredUserReferCode});
                    level++;
                }else user = undefined;
            }

            const mainUser = await User.findById(mainUserId);
            mainUser.coinBalance += transaction.amount;
            await mainUser.save();

            await redis.del(`userReferDashboard-${mainUserId}`);

            return res.status(200).json({
                success: true,
                message: "Money added successfully"
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