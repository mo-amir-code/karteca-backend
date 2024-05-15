import { Types } from "mongoose";
import { TryCatch } from "../middlewares/error.js";
import Cart from "../models/Cart.js";
import ReferMember from "../models/ReferMember.js";
import ReferralLevel from "../models/ReferralLevel.js";
import Transaction from "../models/Transaction.js";
import { CancelPaymentType, CreateSubscriptionType, VerifyPaymentBodyType, VerifyPaymentRequestType, WithdrawalRequestType, WithdrawalRequestVerificationType } from "../types/payment.js";
// import { calculateSHA256 } from "../utils/services.js";
import ErrorHandler from "../utils/utility-class.js";
import { redis } from "../utils/Redis.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import TxnVerifyRequest from "../models/TxnVerifyRequest.js";
import { MailOptions, sendMail } from "../utils/sendOTP.js";
import Subscription from "../models/Subscription.js"
import { makePayment } from "../middlewares/payment.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";

export const verifyPayment = TryCatch(async (req, res, next) => {
  const { paymentStatus, utrId, isFrom, adminNote } =
    req.body as VerifyPaymentBodyType;

  if(!paymentStatus || !utrId){
    return next(new ErrorHandler("Enter all required field(s)", 400))
  }

  // updating user transaction
  const transaction = await Transaction.findOne({ utrId });

  if(transaction){
    transaction.status = paymentStatus;
    // transaction.transactionId = userTransactionId;
  }

  if(paymentStatus !== "success" && transaction) {
    await transaction.save();
    return res.status(200).json({
      success: true,
      message: "Transaction status has been updated"
    })
  }

  if (paymentStatus === "success" && transaction) {
    const mainUserId = new Types.ObjectId(transaction.userId.toString());

    // updating user transaction from procssing to success
    transaction.status = "success";
    await transaction.save();
    // ENd with update




    if (isFrom === "subscription") {

      // Creating subscription
      const subsData = {
        userId: mainUserId,
        type: "premium",
        transaction: transaction._id,
        amount: transaction.amount
      }

      await Subscription.create(subsData);
      // end of subscription

      // Updating transaciton verify request from pending/processing to verified
      await TxnVerifyRequest.findOneAndUpdate({ utrId },  { status: "verified", admin: {
        adminId: mainUserId,
        adminNote
      } });
      // end of transaction verify request

      let level = 1; // initializing level

      // Fetching main user refer member information
      const currentReferMemberMainUser = await ReferMember.findOne({
        userId: mainUserId,
      });

      // Updating main user refer member withdrawal permission
      currentReferMemberMainUser.withdrawalPermission = true;

      // Fetching main user information
      const mainUserInfo = await User.findById(mainUserId);

      // Adding main user coinBalance with current transaction amount
      mainUserInfo.coinBalance += transaction.amount;

      // Saving main user information and refer member information
      await currentReferMemberMainUser.save();
      await mainUserInfo.save();

      // Fetching current refer member with main user referred user refer code
      let currentReferMember = await ReferMember.findOne({
        referCode: currentReferMemberMainUser.referredUserReferCode,
      });

      // running while loop until currentReferMember does contains nill or undefined value and upto 7 levels
      while (currentReferMember && level <= 7) {
        // Fetching level wise earning
        let earning = Math.floor(getLevelWiseMoney(level, transaction.amount));
        
        // adding current level earning in current user refer member's currentReferralEarning and totalReferralEarning
        currentReferMember.currentReferralEarning += earning;
        currentReferMember.totalReferralEarning += earning;
        // Updating with changes
        await currentReferMember.save();

        // Fetching current refer member with current level and current refer member user id
        const currentMemberLevel = await ReferralLevel.findOne({
          level: level,
          userId: currentReferMember.userId
        });

        // checking current Member Level is exist
        if (currentMemberLevel) {
          // If exist then I adds current level earning, enabling withdrawal permission and main user id
          currentMemberLevel.users.push({
            earning: earning,
            isWithdrawalEnabled: true,
            user: mainUserId,
          });
          // Updating with changes
          await currentMemberLevel.save();
        } else {
          // if level not found then I creates with current level, current refer member user id and main user info in users
           await ReferralLevel.create({
            level: level,
            userId: currentReferMember.userId,
            users: [
              { earning: earning, isWithdrawalEnabled: true, user: mainUserId },
            ],
          });
        }

        // Here I am creating a notification to the current refer member user for referral with earning and level
        await Notification.create({
          userId: currentReferMember.userId,
          type: "referral",
          message: `Congratulations! You got ${earning} rupee(s) of referral earning of level ${level}`,
        });

        // Here I am deleting redis cached data of current refer member
        await redis?.del(`userNotifications-${currentReferMember.userId}`);
        await redis?.del(`userReferDashboard-${currentReferMember.userId}`);
        await redis?.del(`userReferShortDashboard-${currentReferMember.userId}`);
        await redis?.del(`userCheckoutWallets-${currentReferMember.userId}`);

        // Here updating level with 1
        level += 1;

        // Here I am finding another level user with current refer member referred user refer code if referred code and user exist then it will assign to currentReferMember otherwise null
        if (currentReferMember.referredUserReferCode){
          currentReferMember = await ReferMember.findOne({
            referCode: currentReferMember.referredUserReferCode,
          });
        }
        else currentReferMember = null;
      }
      // End of while loop


        // Here I am deleting redis cache of main user
        await redis?.del(`userReferDashboard-${mainUserId}`);
        await redis?.del(`userReferShortDashboard-${mainUserId}`);
        await redis?.del(`userCheckoutWallets-${mainUserId}`);

        // Creating notification for main user of activating withdrawal and adding activation amount as coin balance
      await Notification.create({
        userId: mainUserId,
        type: "payment",
        message: `Your withdrawal wallet is activated and ₹${transaction.amount} added as coin in Coin Wallet`,
      });

      // deleting redis cached for mainuser updated notifications
      await redis?.del(`userNotifications-${mainUserId}`);

      return res.status(200).json({
        success: true,
        message: "Withdrawal activated",
      });
    }

    // Updating transaciton verify request from pending/processing to verified
    await TxnVerifyRequest.findOneAndUpdate({ utrId },  { status: "verified", admin: {
      adminId: mainUserId,
      adminNote
    } });
    // end of transaction verify request

    await Cart.deleteMany({ userId: transaction?.userId });

    const wallet = transaction?.wallet as
      | { name: string; amount: number }
      | undefined;

    if (wallet) {
      await redis?.del(`userCheckoutWallets-${mainUserId}`);
      await redis?.del(`userReferShortDashboard-${mainUserId}`);

      switch (wallet?.name) {
        case "mainBalance":
          const user = await User.findById(mainUserId);
          user.mainBalance = user.mainBalance - wallet?.amount;
          await user.save();
          break;
        case "coinBalance":
          const coinUser = await User.findById(mainUserId);
          coinUser.coinBalance = coinUser.coinBalance - wallet?.amount;
          await coinUser.save();
          break;
        case "currentReferralEarning":
          await redis?.del(`userReferDashboard-${mainUserId}`);
          const referMember = await ReferMember.findOne({
            userId: mainUserId,
          });
          referMember.currentReferralEarning = referMember.currentReferralEarning - wallet?.amount;
          await referMember.save();
          break;
        default:
          null;
      }
    }

    await Notification.create({
      userId: mainUserId,
      type: "order",
      message: "Your items has been placed to deliver to you",
    });

    await redis?.del(`userNotifications-${mainUserId}`);
    await redis?.del(`userOrders-${mainUserId}`);
    await redis?.del(`userCartCounts-${mainUserId}`);
    await redis?.del(`userCartItem-${mainUserId}`);

    return res.status(200).json({
      success: true,
      message: "Payment recieved.",
    });
  }

  next(new ErrorHandler("Something went wrong", 400));
});

const getLevelWiseMoney = (level: number, amount: number) => {
  switch (level) {
    case 1:
      return amount * 0.3;
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
      return 0;
  }
};

export const verifyPaymentRequest = TryCatch(async (req, res, next) => {
  const { amount, userId, utrId, transactionId, isFrom } = req.body as VerifyPaymentRequestType;

  if(!amount || !userId || !utrId || !transactionId){
    return next(new ErrorHandler("Required fields is/are empty", 400));
  }

  await TxnVerifyRequest.create({ amount, userId, utrId, type: isFrom });
  await Transaction.findByIdAndUpdate(transactionId, { utrId });

  await Notification.create({
    userId,
    type: "payment",
    message: "Your transaction request has been sent. Please wait for next 2 hours."
  });

  await redis?.del(`userNotifications-${userId}`);

  let usersMailId = await User.find({ role: "admin" });
  usersMailId = usersMailId.map((user) => user.email);

  if(usersMailId.length === 0) usersMailId.push(process.env.ADMIN_MAIL_ID);

  const mailData:MailOptions = {
      from:'Karteca Pvt. Ltd.',
      to: usersMailId,
      subject: `Payment Verification Request for ${isFrom === "subscription"? "Subscription" : "Shopping"}`,
      html: `You got a new payment verification request for ₹${amount}`,
  }

  await sendMail(mailData);

  return res.status(200).json({
    success: true,
    message: "Transaction Verification Request Sent"
  });

});

export const cancelPayment = TryCatch(async (req, res, next) => {
  const { transactionId } = req.body as CancelPaymentType;

  if(!transactionId){
    return next(new ErrorHandler("Required fields is/are empty", 400));
  }

  await Transaction.findByIdAndUpdate(transactionId, { status: "cancelled" });

  return res.status(200).json({
    success: true,
    message: "Transaction Verification Request Sent"
  });
});

export const createSubscription = TryCatch(async (req, res, next) => {
  const { userId, amount, type } = req.body as CreateSubscriptionType

  const user = await User.findById(userId);

  if(!userId || !amount || !type || !user){
    return next(new ErrorHandler("Required field(s) is/are missing", 400));
  }

  const txnData = {
    userId,
    type: "credit",
    mode: "subscription",
    amount
  }

  const txn = await Transaction.create(txnData);


  const paymentQrCodeUrl = await makePayment({email: user.email, totalAmount: amount});

  txn.paymentQrCodeUrl = paymentQrCodeUrl;
  await txn.save();

  return res.status(200).json({
    success: true,
    message: "Subscription payment order created",
    data: {
      paymentQrCodeUrl,
      transactionId: txn._id
    }
  });

});

export const withdrawalRequest = TryCatch(async (req, res, next) => {
  const { amount, userId, upi } = req.body as WithdrawalRequestType;

  if(!amount || !userId || !upi){
    return next(new ErrorHandler("Required field(s) is/are missing", 400));
  }

  const isExist = await User.findById(userId).select("_id");
  
  if(!isExist){
    return next(new ErrorHandler("Enter valid user id", 401));
  }
  

  const referMember = await ReferMember.findOne({ userId });

  if(!referMember){
    return next(new ErrorHandler("Something went wrong!", 401));
  }

  if(amount > referMember.currentReferralEarning){
    return next(new ErrorHandler("Something went wrong!", 401));
  }

  referMember.currentReferralEarning -= amount;
  referMember.holdAmount += amount;
  await referMember.save();

  const withdrawalRequestData = {
    userId,
    amount,
    to: {
      upi
    }
  }

  await WithdrawalRequest.create(withdrawalRequestData);

  await Notification.create({
    userId,
    message: `Withdrawal request has been sent and ₹${amount} on hold until withdrawal verification`,
    type: "payment"
  });

  await redis?.del(`userNotifications-${userId}`);
  await redis?.del(`userReferDashboard-${userId}`);
  await redis?.del(`userReferShortDashboard-${userId}`);
  await redis?.del(`userCheckoutWallets-${userId}`);

  return res.status(200).json({
    success: true,
    message: "Amount will be sent to your upi id under 6 hours"
  });
});

export const withdrawalRequestVerification = TryCatch(async (req, res, next) => {
  const { upi, utrId, withdrawalRequestId, withdrawalStatus } = req.body as WithdrawalRequestVerificationType;

  if(!upi || !utrId || !withdrawalRequestId || !withdrawalStatus){
    return next(new ErrorHandler("Required fields is/are empty", 400));
  }

  const withdrawalRequest = await WithdrawalRequest.findByIdAndUpdate(withdrawalRequestId, { 
    utrId,
    status: "success",
    from:{
      upi
    }
   });

   await Transaction.create({
    userId: withdrawalRequest.userId,
    type: "withdrawal",
    mode: "referral",
    utrId,
    amount: withdrawalRequest.amount,
    status: "success"
   });

   await Notification.create({
    userId: withdrawalRequest.userId,
    message: `₹${withdrawalRequest.amount} has been sent to your upi id`,
    type: "payment"
   });

   await redis?.del(`userNotifications-${withdrawalRequest.userId}`);
   await redis?.del(`userTransactions-${withdrawalRequest.userId}`);


   return res.status(200).json({
    success: true,
    message: "Updated"
   });

});