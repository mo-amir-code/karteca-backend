import mongoose, { Schema, Document, Types } from "mongoose";

interface RatingAndReviewsType extends Document {
  _id: string;
  product: Types.ObjectId;
  userId: Types.ObjectId;
  rate: number;
  title?: string;
  description?: string;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema<RatingAndReviewsType> =
  new Schema<RatingAndReviewsType>(
    {
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      rate: { type: Number, required: true },
      title: { type: String },
      description: { type: String },
      likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
      dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
      images: [{ type: String }],
    },
    {
      timestamps: true,
    }
  );

export default mongoose.models.RatingAndReviews ||
  mongoose.model<RatingAndReviewsType>("RatingAndReviews", RatingSchema);
