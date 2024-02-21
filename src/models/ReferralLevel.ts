import mongoose, { Schema, Document, Model, Types } from "mongoose";

interface ReferralLevelType extends Document {
  _id: string;
  userId: Types.ObjectId;
  level: number;
  users: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const referralsSchema: Schema<ReferralLevelType> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  level: { type: Number, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, {
    timestamps: true
});

const ReferralLevelModel: Model<ReferralLevelType> =
  mongoose.models.ReferralLevel ||
  mongoose.model<ReferralLevelType>("ReferralLevel", referralsSchema);

export default ReferralLevelModel;
