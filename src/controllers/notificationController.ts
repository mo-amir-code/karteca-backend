import { TryCatch } from "../middlewares/error.js";
import Notification from "../models/Notification.js";
import { redis } from "../utils/Redis.js";
import ErrorHandler from "../utils/utility-class.js";


export const getUserNotifications = TryCatch(async (req, res, next) => {
    const {userId} = req.params;

    if(!userId){
        return next(new ErrorHandler("User ID not found", 404));
    }

    let catchedNtf = await redis.get(`userNotifications-${userId}`);

    if(catchedNtf){
        return res.status(200).json({
            success: true,
            message: "Notifications fetched",
            data: JSON.parse(catchedNtf)
        })
    }

    const ntf = await Notification.find({userId}).select("-userId");
    let nt = ntf.reduce((total, current) => {
        if(!current.isRead) return total + 1;
        else return total;
    }, 0);

    const data = {
        notifications: ntf,
        notificationCount: nt
    }

    await redis.set(`userNotifications-${userId}`, JSON.stringify(data))

    return res.status(200).json({
        success: true,
        message: "Notifications fetched",
        data
    })
});

export const readUserNotifications = TryCatch(async (req, res, next) => {
    const {userId} = req.params;

    if(!userId){
        return next(new ErrorHandler("User ID not found", 404));
    }

    await Notification.updateMany(
        { userId: userId, isRead: false },
        { $set: { isRead: true } }
    );
    
    await redis.del(`userNotifications-${userId}`);

    return res.status(200).json({
        success: true,
        message: "Notifications read",
    })
});