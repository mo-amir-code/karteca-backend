import mongoose, {Schema} from "mongoose";

interface BannerType extends Document {
    userId: Schema.Types.ObjectId;
    product: Schema.Types.ObjectId;
    bannerUrl: string;
    position: "top" | "bottom" | "left" | "right";
    promotionStart: Date;
    promotionExpiry: Date;
    createdAt: Date;
    updatedAt: Date;
}

const bannerSchema: Schema<BannerType> = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    product: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    bannerUrl: {type: String, required: true},
    position: {type: String, required: true, enum: ["top", "bottom", "left", "right"]},
    promotionStart: { type: Date, required: true },
    promotionExpiry: { type: Date, required: true },
}, {
    timestamps: true
});

export default mongoose.models.Banner || mongoose.model<BannerType>("Banner", bannerSchema);