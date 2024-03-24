import mongoose, { Schema, Document } from "mongoose";

interface CouponType extends Document {
    code: string;
    amount: number;
    title: string;
    message: string;
    expiry: Date;
    mode: "money" | "percentage";
    upto: number;
    isClaimed: boolean;
    quantity: number;
    issuedBy: "admin" | "company";
}

const couponSchema: Schema<CouponType> = new Schema({
    code: {type: String, required: true, unique: true},
    amount: {type: Number, required: true},
    title: {type: String, required: true},
    message: {type: String, required: true},
    expiry: {type: Date, required: true},
    mode: {type: String, default: "percentage", enum: ["money", "percentage"]},
    upto: {type: Number, required: true},
    isClaimed: {type: Boolean, default: false},
    quantity: {type: Number, required: true},
    issuedBy: {type: String, enum: ["admin", "company"], required:true},
});

export default mongoose.models.Coupon || mongoose.model<CouponType>("Coupon", couponSchema);