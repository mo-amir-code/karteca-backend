import mongoose, { Schema, Document } from "mongoose";

interface CategoryType extends Document {
  parent: {
    name: string,
    image: string
  },
  childs: ChildCategoryType[]
  createdAt: Date;
  updatedAt: Date;
}

type ChildCategoryType = {
  name: string,
  image: string,
  publicId: string
}

const CategoriesImageSchema: Schema<CategoryType> = new Schema(
  {
    parent: {
      name: { type: String, required: true },
      image: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    childs: [
      {
        name: { type: String, required: true },
        image: { type: String, required: true },
        publicId: { type: String, required: true }
      }
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CategoriesImage ||
  mongoose.model<CategoryType>("CategoriesWithImage", CategoriesImageSchema);
