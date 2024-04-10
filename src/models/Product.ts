import mongoose, { Schema, Document } from "mongoose";

interface ProductType extends Document {
  sellerId: Schema.Types.ObjectId;
  title: string;
  description: object;
  price: number;
  stock: number;
  colors: string[];
  discount: number;
  sold: number;
  thumbnail: string;
  images: string[];
  category: {
    parent: string;
    child: string
  };
  highlights?: string[];
  warranty?: {
    serviceType: string;
    covered: string;
  };
  specifications: object;
  importantNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema: Schema<ProductType> = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: Schema.Types.Mixed, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    colors: [{ type: String }],
    discount: { type: Number, required: true, min: 0, max: 100 },
    sold: { type: Number, default: 0 },
    thumbnail: { type: String, required: true },
    images: [{ type: String }],
    category: {
      parent: {type: String, required: true},
      child: {type: String, required: true}
    },
    highlights: [{ type: String }],
    warranty: {
      serviceType: { type: String, default: "NA" },
      covered: { type: String, default: "NA" },
    },
    specifications: { type: Object },
    importantNote: { type: String }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model<ProductType>("Product", productSchema);
