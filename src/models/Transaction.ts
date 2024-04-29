import mongoose, { Document, Schema, Model } from "mongoose";

interface TransactionType extends Document {
  userId: Schema.Types.ObjectId;
  type: "withdrawal" | "invest" | "spend";
  mode: "referral" | "giftCard" | "shopping" | "promotion";
  wallet?:{
    name: { type: String },
    amount: { type: Number }
  }
  transactionId: string,
  paymentQrCodeUrl: string,
  amount: number;
  status: "pending" | "processing" | "failed" | "success";
  currency: "inr" | "usd";
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema: Schema<TransactionType> = new Schema<TransactionType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: ["withdrawal", "credit", "spend"],
    },
    mode: {
      type: String,
      required: true,
      enum: ["referral", "giftCard", "shopping", "subscription"],
    },
    wallet:{
      name: { type: String },
      amount: { type: Number }
    },
    transactionId: { type: String },
    paymentQrCodeUrl: { type: String },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "failed", "success", "cancelled"],
      default: 'pending'
    },
    currency: { type: String, default: "inr", enum: ["inr", "usd"] },
  },
  {
    timestamps: true,
  }
);

const TransactionModel: Model<TransactionType> =
  mongoose.models.Transaction ||
  mongoose.model<TransactionType>("Transaction", transactionSchema);

export default TransactionModel;
