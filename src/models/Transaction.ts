import mongoose, { Document, Schema, Model } from "mongoose";

interface TransactionType extends Document {
  _id: string;
  userId: Schema.Types.ObjectId;
  type: "withdrawal" | "credit" | "spend";
  mode: "referral" | "giftCard" | "shopping";
  transactionId: string;
  amount: number;
  status: "pending" | "processing" | "failed" | "success";
  bankDetails?: {
    name: string;
    accountNumber: number;
    ifsc: string;
  };
  upiId?: string;
  card?: Schema.Types.ObjectId;
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
      enum: ["referral", "giftCard", "shopping"],
    },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "failed", "success"],
    },
    bankDetails: {
      name: { type: String },
      accountNumber: { type: Number },
      ifsc: { type: String },
    },
    upiId: { type: String },
    card: { type: Schema.Types.ObjectId, ref: "Card" },
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
