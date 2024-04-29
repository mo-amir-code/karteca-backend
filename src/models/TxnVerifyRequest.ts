import mongoose, {Schema} from "mongoose";

interface TxnVerifyRequestType extends Document {
    userId: Schema.Types.ObjectId;
    transactionId: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

const txnVerifyRequestSchema: Schema<TxnVerifyRequestType> = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    transactionId: {type: String, required: true},
    amount: {type: Number, required: true},
},
{
    timestamps: true
});

export default mongoose.models.TxnVerifyRequest || mongoose.model<TxnVerifyRequestType>("TxnVerifyRequest", txnVerifyRequestSchema);