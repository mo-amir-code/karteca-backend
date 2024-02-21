import mongoose, {Schema} from "mongoose";

interface CartType extends Document {
    _id: string,
    userId: Schema.Types.ObjectId,
    product: Schema.Types.ObjectId,
    color?: string,
    quantity: number,
    currentPrice: number,
    totalAmount: number,
    createdAt: Date,
    updatedAt: Date
}

const cartSchema: Schema<CartType> = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    product: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    color: {type: String},
    quantity: {type: Number, default: 1},
    currentPrice: {type: Number, required: true},
    totalAmount: {type: Number, required: true},
});

export default mongoose.models.Cart || mongoose.model<CartType>("Cart", cartSchema);