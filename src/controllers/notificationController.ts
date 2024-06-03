import { TryCatch } from "../middlewares/error.js";
import Notification from "../models/Notification.js";
import { redis } from "../utils/redis/Redis.js";
import {
  getUserNotReadNotificationCountKey,
  getUserNotificationKey,
} from "../utils/redis/redisKeys.js";
import ErrorHandler from "../utils/utility-class.js";

export const getUserNotifications = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("User ID not found", 400));
  }

  const ntfKey = getUserNotificationKey(userId);

  let catchedNtf = await redis?.lrange(ntfKey, 0, -1);
  catchedNtf = catchedNtf?.map((item) => JSON.parse(item));

  let catchedNtfCount = await redis?.get(
    getUserNotReadNotificationCountKey(userId)
  );

  if (catchedNtf && catchedNtfCount) {
    return res.status(200).json({
      success: true,
      message: "Notifications fetched",
      data: {
        notifications: catchedNtf,
        notificationCount: catchedNtfCount,
      },
    });
  }

  const ntf = await Notification.find({ userId }).select("-userId");
  let nt = ntf.reduce((total, current) => {
    if (!current.isRead) return total + 1;
    else return total;
  }, 0);

  const data = {
    notifications: ntf.reverse(),
    notificationCount: nt,
  };

  await redis?.set(getUserNotReadNotificationCountKey(userId),nt);
  
  ntf.reverse().forEach(async (item) => {
    await redis?.rpush(ntfKey, JSON.stringify(item));
  });

  return res.status(200).json({
    success: true,
    message: "Notifications fetched",
    data,
  });
});

export const readUserNotifications = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("User ID not found", 400));
  }

  await Notification.updateMany(
    { userId: userId, isRead: false },
    { $set: { isRead: true } },
    { new: true }
  );

  const ntfs = await Notification.find({ userId }).select("-userId");

  const ntfKey = getUserNotificationKey(userId);
  await redis?.del(ntfKey);

  ntfs.reverse().forEach( async (item) => {
    await redis?.rpush(ntfKey, JSON.stringify(item));
  });
  await redis?.set(getUserNotReadNotificationCountKey(userId), 0);

  return res.status(200).json({
    success: true,
    message: "Notifications read",
  });
});
