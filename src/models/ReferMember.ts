import mongoose, { Schema, Document } from "mongoose";

interface ReferMemberType extends Document {
  userId: Schema.Types.ObjectId;
  withdrawalPermission: boolean;
  currentReferralEarning: number;
  totalReferralEarning: number;
  referredUserReferCode: string;
  referCode: string;
  holdAmount: number,
  createdAt: Date;
  updatedAt: Date;
}

const referMemberSchema: Schema<ReferMemberType> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  withdrawalPermission: { type: Boolean, default: false },
  currentReferralEarning: { type: Number, default: 0 },
  totalReferralEarning: { type: Number, default: 0 },
  referredUserReferCode: { type: String },
  holdAmount: { type: Number, default: 0 },
  referCode: { type: String, required: true, unique: true }
}, {
    timestamps: true
});

export default mongoose.models.ReferMember || mongoose.model<ReferMemberType>("ReferMember", referMemberSchema);