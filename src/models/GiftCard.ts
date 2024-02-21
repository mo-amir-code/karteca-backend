import mongoose, { Schema, Document, Model } from "mongoose";

interface GiftCardType extends Document {
  _id: string;
  gifterId: Schema.Types.ObjectId;
  gifterName?: string;
  recieverId: Schema.Types.ObjectId;
  recieverName: string;
  code: number;
  amount: number;
  message?: string;
  paymentMode: "card" | "upi";
  transaction: Schema.Types.ObjectId;
  expiry: Date;
  isClaimed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const giftCardSchema: Schema<GiftCardType> = new Schema(
  {
    gifterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gifterName: { type: String },
    recieverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recieverName: { type: String, required: true },
    code: { type: Number, required: true, unique: true },
    amount: { type: Number, required: true },
    message: { type: String },
    paymentMode: { type: String, enum: ["card", "upi"], required: true },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    expiry: { type: Date, required: true },
    isClaimed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const GiftCardModel: Model<GiftCardType> =
  mongoose.models.GiftCard ||
  mongoose.model<GiftCardType>("GiftCard", giftCardSchema);

export default GiftCardModel;
