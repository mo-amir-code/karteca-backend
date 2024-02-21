import mongoose, { Schema, Document } from "mongoose";

interface ProductType extends Document {
  _id: string;
  ownerId: Schema.Types.ObjectId;
  title: string;
  description: string | object;
  price: number;
  stock: number;
  colors: string[];
  discount: number;
  sold: number;
  thumbnail: string;
  images: string[];
  category: "audio" | "audio and video" | "gadgets";
  subCategory: "wired" | "wireless" | "analog" | "smart";
  highlights: string[];
  warranty: {
    serviceType: string;
    covered: string;
  };
  specifications: object;
  importantNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema: Schema<ProductType> = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String || Object, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    colors: [{ type: String }],
    discount: { type: Number, required: true, min: 0, max: 100 },
    sold: { type: Number, default: 0 },
    thumbnail: { type: String, required: true },
    images: [{ type: String }],
    category: {
      type: String,
      required: true,
      enum: ["audio", "audio and video", "gadgets"],
    },
    subCategory: {
      type: String,
      required: true,
      enum: ["wired", "wireless", "analog", "smart"],
    },
    highlights: [{ type: String }],
    warranty: {
      serviceType: { type: String, default: "NA" },
      covered: { type: String, default: "NA" },
    },
    specifications: { type: Object },
    importantNote: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model<ProductType>("Product", productSchema);
