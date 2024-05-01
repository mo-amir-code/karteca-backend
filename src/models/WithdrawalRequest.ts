import mongoose, {Schema} from "mongoose";

interface WithdrawalRequestType extends Document {
    userId: Schema.Types.ObjectId;
    transactionId?: string;
    amount: number;
    to: {
        bank: { type: Schema.Types.ObjectId, ref: "Bank" },
        upi: { type: String },
    }
    createdAt: Date;
    updatedAt: Date;
}

const withdrawalRequestSchema: Schema<WithdrawalRequestType> = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    transactionId: {type: String, required: true},
    amount: {type: Number, required: true},
    to: {
        bank: { type: Schema.Types.ObjectId, ref: "Bank" },
        upi: { type: String },
    }
},
{
    timestamps: true
});

export default mongoose.models.WithdrawalRequest || mongoose.model<WithdrawalRequestType>("WithdrawalRequest", withdrawalRequestSchema);