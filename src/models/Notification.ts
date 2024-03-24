import mongoose, { Schema, Document } from "mongoose";

interface NotificationType extends Document {
  userId: Schema.Types.ObjectId;
  message: string;
  type: "payment" | "order" | "offer" | "other";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationType>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["payment", "order", "offer", "other"],
  },
  isRead: { type: Boolean, default: false },
});

export default mongoose.models.Notification ||
  mongoose.model<NotificationType>("Notification", notificationSchema);
