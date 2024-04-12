import mongoose, {Schema} from "mongoose";

interface BannerType extends Document {
    compaigner: {
        type: "user" | "admin",
        user: Schema.Types.ObjectId
    };
    product: Schema.Types.ObjectId;
    bannerUrl: string;
    position: "top" | "bottom" | "left" | "right" | "topRight" | "topLeft" | "bottomRight" | "bottomLeft" | "center" | "centerRight" | "centerLeft";
    promotionStart: Date;
    promotionExpiry: Date;
    transaction: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const bannerSchema: Schema<BannerType> = new Schema({
    compaigner: {
        type: { type: String, enum:["user", "admin"] },
        user: { type: Schema.Types.ObjectId, ref: "User" }
    },
    product: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    bannerUrl: {type: String, required: true},
    position: {type: String, required: true, enum: ["top", "bottom", "left", "right", "topRight", "topLeft", "bottomRight", "bottomLeft", "center", "centerRight", "centerLeft"]},
    promotionStart: { type: Date, required: true },
    promotionExpiry: { type: Date, required: true },
    transaction: { type: Schema.Types.ObjectId, ref: "Transaction", required: true },
}, {
    timestamps: true
});

export default mongoose.models.Banner || mongoose.model<BannerType>("Banner", bannerSchema);