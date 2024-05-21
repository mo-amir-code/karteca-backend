import { TryCatch } from "../middlewares/error.js";
import { makePayment } from "../middlewares/payment.js";
import ReferMember from "../models/ReferMember.js";
import ReferralLevel, { ReferLevelUser } from "../models/ReferralLevel.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { LevelEarningType } from "../types/refer.js";
import { CTransactionType } from "../types/user.js";
import { redis } from "../utils/Redis.js";
import ErrorHandler from "../utils/utility-class.js";


export const userReferralEarning = TryCatch(async (req, res, next) => {
    const { userId } = req.params as {userId: string};
  
    if(!userId){
      return next(new ErrorHandler("Something is missing", 400));
    }
  
    const user = await ReferMember.findOne({userId}).select("currentReferralEarning");
    
    return res.status(200).json({
      success: true,
      message: "Referral earning fetched",
      data: (user?.currentReferralEarning || 0).toString()
    });
    
  });

export const fetchUserDashboard = TryCatch(async (req, res, next) => {
    const { userId } = req.params as {userId: string};
  
    if(!userId){
      return next(new ErrorHandler("Something is missing", 400));
    }

    const catchedUserDashboard = await redis?.get(`userReferDashboard-${userId}`);

    if(catchedUserDashboard){
      return res.status(200).json({
        success: true,
        message: "Dashboard fatched",
        data: JSON.parse(catchedUserDashboard)
      });
    }

    const referUser = await ReferMember.findOne({userId});
    const levels = await ReferralLevel.find({userId}).select("-userId -_id -createdAt");

    if(!referUser){
      return next(new ErrorHandler("Something went wrong", 400))
    }

    const {totalReferralEarning, currentReferralEarning, withdrawalPermission, referCode} = referUser;

    let levelsEarning = levels.map((lvl) => {

      const withdrawalEnabledUsers = lvl.users.reduce((totalActive:number, current:ReferLevelUser) => {
        if(current.isWithdrawalEnabled)
          return totalActive + 1;
        else
          return totalActive
      },  0);

      const withdrawalDisabledUsers = lvl.users.length - withdrawalEnabledUsers;

      const earnedMoney = lvl.users.reduce((total:number, current:ReferLevelUser) => {
        if(current.isWithdrawalEnabled)
          return total + current.earning;
        else
          return total;
      },  0);

      return {
        level: lvl.level,
        withdrawalDisabledUsers,
        withdrawalEnabledUsers,
        earning: earnedMoney
      }

    });

    if(!levelsEarning.length){
      levelsEarning = [{
        level: 1,
        withdrawalDisabledUsers: 0,
        withdrawalEnabledUsers: 0,
        earning: 0
      }];
    }

    const withdrawalHistory = await Transaction.find({$and: [{userId: userId}, {"wallet.name": "currentReferralEarning"}]}).select("_id wallet status createdAt");

  
    const resData = {
      currentEarning: currentReferralEarning,
      totalEarning: totalReferralEarning,
      totalWithdrawal: (totalReferralEarning - currentReferralEarning) || 0,
      isWithdrawalPermission: withdrawalPermission,
      referCode,
      levelsEarning: levelsEarning,
      withdrawalHistory: withdrawalHistory.reverse()
    }

    await redis?.set(`userReferDashboard-${userId}`, JSON.stringify(resData));
    
    return res.status(200).json({
      success: true,
      message: "Dashboard fatched",
      data: resData
    });
    
  }); // redis done

export const fetchUserShortDashboard = TryCatch(async (req, res, next) => {
    const { userId } = req.params as {userId: string};
  
    if(!userId){
      return next(new ErrorHandler("Something is missing", 400));
    }

    const catchedUserDashboard = await redis?.get(`userReferShortDashboard-${userId}`);

    if(catchedUserDashboard){
      return res.status(200).json({
        success: true,
        message: "Dashboard fatched",
        data: JSON.parse(catchedUserDashboard)
      });
    }

    const referUser = await ReferMember.findOne({userId});
    const levels = await ReferralLevel.find({userId}).select("-userId -_id -createdAt");

    if(!referUser){
      return next(new ErrorHandler("Something went wrong", 400));
    }

    const {totalReferralEarning, currentReferralEarning} = referUser;

    let levelsEarning = levels.map((lvl) => {

      const withdrawalEnabledUsers = lvl.users.reduce((totalActive:number, current:ReferLevelUser) => {
        if(current.isWithdrawalEnabled)
          return totalActive + 1;
        else
          return totalActive
      },  0);

      const earnedMoney = lvl.users.reduce((total:number, current:ReferLevelUser) => {
        if(current.isWithdrawalEnabled)
          return total + current.earning;
        else
          return total;
      },  0);

      return {
        level: lvl.level,
        withdrawalEnabledUsers,
        earning: earnedMoney,
        totalConnectionsPerLevel: lvl.users.length
      }

    });

    if(!levelsEarning.length){
      levelsEarning = [{
        level: 1,
        withdrawalEnabledUsers: 0,
        earning: 0,
        totalConnectionsPerLevel:0
      }];
    }

    const totalActiveConnections = levelsEarning.reduce((total: number, current: LevelEarningType) => {
      return total + current.withdrawalEnabledUsers;
    }, 0);

    const totalConnections = levelsEarning.reduce((total: number, current: LevelEarningType) => {
      return total + current.totalConnectionsPerLevel;
    }, 0);
  
    const resData = {
      totalEarning: totalReferralEarning,
      totalWithdrawal: totalReferralEarning - currentReferralEarning,
      totalActive: totalActiveConnections,
      totalConnections
    }

    await redis?.set(`userReferShortDashboard-${userId}`, JSON.stringify(resData));
    
    return res.status(200).json({
      success: true,
      message: "Dashboard fatched",
      data: resData
    });
    
  }); // redis done

export const addMoney = TryCatch(async (req, res, next) => {
  const { amount, userId } = req.body;

  const transactionData:CTransactionType = {
    mode: "referral",
    type: "invest",
    amount,
    userId
  }

  const newTransaction = await Transaction.create(transactionData);

  const {email} = await User.findById(userId);

  const paymentQrCodeUrl = await makePayment({totalAmount:amount, email});
  newTransaction.paymentQrCodeUrl = paymentQrCodeUrl;
  await newTransaction.save();

  return res.status(200).json({
    success: true,
    message: "Add money order created",
    paymentQrCodeUrl
  });
    
}); 