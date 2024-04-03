import { TryCatch } from "../middlewares/error.js";
import ReferMember from "../models/ReferMember.js";
import ErrorHandler from "../utils/utility-class.js";


export const userReferralEarning = TryCatch(async (req, res, next) => {
    const { userId } = req.params as {userId: string};
  
    if(!userId){
      return next(new ErrorHandler("Something is missing", 404));
    }
  
    const user = await ReferMember.findOne({userId}).select("currentReferralEarning"); 
    
    return res.status(200).json({
      success: true,
      message: "Password changed",
      data: (user?.currentReferralEarning || 0).toString()
    });
    
  });