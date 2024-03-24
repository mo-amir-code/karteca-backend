import mongoose, { Schema } from "mongoose";

interface CardType extends Document {
  userId: Schema.Types.ObjectId;
  cardServiceName: string;
  cardNumber: number;
  expirationDate: Date;
  cvc: number;
  cardOwnerName: string;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema:Schema<CardType> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    cardServiceName: { type: String, required: true },
    cardNumber: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    cvc: { type: Number, required: true },
    cardOwnerName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Card || mongoose.model<CardType>("Card", cardSchema);
