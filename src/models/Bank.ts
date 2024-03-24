import mongoose, {Schema} from "mongoose";

interface BankType extends Document {
    userId: Schema.Types.ObjectId;
    name: string;
    accountNumber: number;
    ifsc: string;
    createdAt: Date;
    updatedAt: Date;
}

const bankSchema: Schema<BankType> = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    name: {type: String, required: true},
    accountNumber: {type: Number, required: true},
    ifsc: {type: String, required: true},
},
{
    timestamps: true
});

export default mongoose.models.Bank || mongoose.model<BankType>("Bank", bankSchema);