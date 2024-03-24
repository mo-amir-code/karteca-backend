import mongoose, { Schema, Document, Model, Types } from "mongoose";

interface WishlistType extends Document {
  userId: Types.ObjectId;
  products: [Schema.Types.ObjectId];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema: Schema<WishlistType> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  }
);

const WishlistModel: Model<WishlistType> =
  mongoose.models.Wishlist ||
  mongoose.model<WishlistType>("Wishlist", wishlistSchema);

export default WishlistModel;
