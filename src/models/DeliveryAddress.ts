import mongoose, { Schema, Document } from "mongoose";

interface DeliveryAddressType extends Document {
  _id: string;
  userId: Schema.Types.ObjectId;
  name: string;
  email: string;
  address: string;
  country: string;
  state: string;
  city: string;
  postalCode: number;
  phone: number;
  createdAt: Date,
  updatedAt: Date;
}

const deliveryAddressSchema: Schema<DeliveryAddressType> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: Number, required: true },
  phone: { type: Number, required: true },
},
{
    timestamps: true
});

export default mongoose.models.DeliveryAddress || mongoose.model<DeliveryAddressType>("DeliveryAddress", deliveryAddressSchema);