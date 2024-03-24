import mongoose, { Document, Schema } from "mongoose";

export interface UserType extends Document {
  name: string;
  email: string;
  gender: "male" | "female" | "transgender";
  role: "customer" | "seller" | "admin";
  password: string;
  phone?: string;
  verified: boolean;
  currency: "inr" | "usd";
  address: {
    country: string;
    state: string;
    city: string;
  };
  upiIds?: string[];
  mainBalance: number;
  coinBalance: number;
  otp?: string;
  otpExpiry?: number;
  otpToken?: string;
  sessionToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<UserType> = new Schema<UserType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "transgender"],
    },
    role: {
      type: String,
      default: "customer",
      enum: ["customer", "seller", "admin"],
    },
    password: { type: String, required: true },
    phone: { type: String, unique: true },
    verified: { type: Boolean, default: false },
    currency: { type: String, default: "inr", enum: ["inr", "usd"] },
    address: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
    },
    upiIds: [{ type: String }],
    mainBalance: { type: Number, default: 0 },
    coinBalance: { type: Number, default: 0 },
    otp: { type: String },
    otpExpiry: { type: Number },
    otpToken: { type: String },
    sessionToken: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<UserType>("User", userSchema);
