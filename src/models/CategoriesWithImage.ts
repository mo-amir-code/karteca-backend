import mongoose, { Schema, Document } from "mongoose";

interface ProductType extends Document {
  categories: CategoryType[];
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryType {
    parent: string;
    child?: string;
    parentImage: string;
    childImage?: string;
}

const CategoriesImageSchema: Schema<ProductType> = new Schema(
  {
    categories: [
        {
            parent: { type: String, required: true },
            child: { type: String },
            parentImage: { type: String, required: true },
            childImage: { type: String }
        }
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CategoriesImage ||
  mongoose.model<ProductType>("CategoriesImage", CategoriesImageSchema);
