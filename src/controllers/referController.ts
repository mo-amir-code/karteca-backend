import { TryCatch } from "../middlewares/error.js";
import ReferMember from "../models/ReferMember.js";
import ReferralLevel, { ReferLevelUser } from "../models/ReferralLevel.js";
import Transaction from "../models/Transaction.js";
import { redis } from "../utils/Redis.js";
import ErrorHandler from "../utils/utility-class.js";


export const userReferralEarning = TryCatch(async (req, res, next) => {
    const { userId } = req.params as {userId: string};
  
    if(!userId){
      return next(new ErrorHandler("Something is missing", 404));
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
      return next(new ErrorHandler("Something is missing", 404));
    }

    const catchedUserDashboard = await redis.get(`userReferDashboard-${userId}`);

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
      return res.status(400).json({
        success: false,
        message: "Something went wrong"
      });
    }

    const {totalEarning, currentReferralEarning, withdrawalPermission, referCode} = referUser;

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

    const withdrawalHistory = await Transaction.find({$and: [{userId: userId, type: "withdrawal"}]}).select("_id amount status createdAt");

  
    const resData = {
      currentEarning: currentReferralEarning,
      totalEarning: totalEarning,
      totalWithdrawal: (totalEarning - currentReferralEarning) || 0,
      isWithdrawalPermission: withdrawalPermission,
      referCode,
      levelsEarning: levelsEarning,
      withdrawalHistory
    }

    await redis.set(`userReferDashboard-${userId}`, JSON.stringify(resData));
    
    return res.status(200).json({
      success: true,
      message: "Dashboard fatched",
      data: resData
    });
    
  }); // redis done