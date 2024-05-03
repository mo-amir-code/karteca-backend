import mongoose, {Schema} from "mongoose";

interface WithdrawalRequestType extends Document {
    userId: Schema.Types.ObjectId;
    utrId?: string;
    amount: number;
    status: "pending" | "processing" | "verified" | "success" | "failed";
    to: {
        bank: { type: Schema.Types.ObjectId, ref: "Bank" },
        upi: { type: String },
    },
    from: {
        bank: { type: Schema.Types.ObjectId, ref: "Bank" },
        upi: { type: String },
    },
    createdAt: Date;
    updatedAt: Date;
}

const withdrawalRequestSchema: Schema<WithdrawalRequestType> = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    utrId: {type: String},
    amount: {type: Number, required: true},
    status: {type: String, default: "processing", enum: ["pending", "processing", "verified", "success", "failed"]},
    to: {
        bank: { type: Schema.Types.ObjectId, ref: "Bank" },
        upi: { type: String },
        },
    from: {
        bank: { type: Schema.Types.ObjectId, ref: "Bank" },
        upi: { type: String }
    }
},
{
    timestamps: true
});

export default mongoose.models.WithdrawalRequest || mongoose.model<WithdrawalRequestType>("WithdrawalRequest", withdrawalRequestSchema);