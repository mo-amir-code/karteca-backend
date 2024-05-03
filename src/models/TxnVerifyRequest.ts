import mongoose, {Schema} from "mongoose";

interface TxnVerifyRequestType extends Document {
    userId: Schema.Types.ObjectId;
    utrId: string;
    amount: number;
    type: "shopping" | "subscription";
    status?: "pending" | "processing" | "verified" | "cancelled" | "failed";
    admin: {
        adminId: string,
        adminNote: string
    },
    createdAt: Date;
    updatedAt: Date;
}

const txnVerifyRequestSchema: Schema<TxnVerifyRequestType> = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    utrId: {type: String, required: true, unique: true},
    amount: {type: Number, required: true},
    status: { type: String, default: "processing", enum: ["pending", "processing", "verified", "cancelled", "failed"] },    
    admin: {
        adminId: { type: Schema.Types.ObjectId, ref: "User" },
        adminNote: { type: String }
    },
    type: { type: String, enum: ["shopping", "subscription"] }
},
{
    timestamps: true
});

export default mongoose.models.TxnVerifyRequest || mongoose.model<TxnVerifyRequestType>("TxnVerifyRequest", txnVerifyRequestSchema);