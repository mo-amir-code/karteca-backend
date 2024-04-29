import mongoose, { Schema } from "mongoose";


interface SubscriptionType extends Document{
    _id: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    type: "basic" | "pro" | "premium",
    transaction: Schema.Types.ObjectId,
    amount: number,
    createdAt: Date,
    updatedAt: Date
}

const subscriptionSchema: Schema<SubscriptionType> = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    type: { type: String, required: true, enum:["basic", "pro", "premium"] },
    amount: { type: Number, required: true },
    transaction: { type: Schema.Types.ObjectId, required: true, ref: "Transaction" },
});

export default mongoose.models.Subscription || mongoose.model<SubscriptionType>("Subscription", subscriptionSchema);