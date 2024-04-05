import mongoose, { Schema, Document, Model, Types } from "mongoose";

interface ReferralLevelType extends Document {
  userId: Types.ObjectId;
  level: number;
  users: ReferLevelUser[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferLevelUser{
  user: Types.ObjectId,
  isWithdrawalEnabled: boolean,
  earning: number
}

const referralsSchema: Schema<ReferralLevelType> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  level: { type: Number, required: true },
  users: [
    { 
      user: { type: Schema.Types.ObjectId, ref: "User"},
      isWithdrawalEnabled: {type: Boolean, default: false},
      earning:{ type: Number, default: 0 }
    }
  ],
}, {
    timestamps: true
});

const ReferralLevelModel: Model<ReferralLevelType> =
  mongoose.models.ReferralLevel ||
  mongoose.model<ReferralLevelType>("ReferralLevel", referralsSchema);

export default ReferralLevelModel;
