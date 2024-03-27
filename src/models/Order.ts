import mongoose, { Schema, Document } from "mongoose";

interface OrderType extends Document {
  userId: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  purchasedPrice: number;
  color?: string;
  quantity: number;
  deliveryAddress: Schema.Types.ObjectId;
  deliveryStatus: "pending" | "dispatched" | "shipped" | "delivered";
  orderStatus: "successful" | "cancelled" | "processing";
  refund?: "cancelled" | "processing" | "success";
  paymentMode: "card" | "upi" | "cash";
  totalAmount: number;
  transaction: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema: Schema<OrderType> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    purchasedPrice: { type: Number, required: true },
    color: { type: String },
    quantity: { type: Number, required: true },
    deliveryAddress: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryAddress",
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "dispatched", "shipped", "delivered"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["successful", "cancelled", "processing"],
      default: "processing"
    },
    refund: { type: String, enum: ["cancelled", "processing", "success"] },
    paymentMode: {
      type: String,
      enum: ["online", "cash"],
      required: true,
    },
    totalAmount: { type: Number, required: true },
    transaction: { type: Schema.Types.ObjectId, required: true, ref: "Transaction" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model<OrderType>("Order", orderSchema);
