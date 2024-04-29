import mongoose, {Schema} from "mongoose";

interface AdminType extends Document {
    userId: Schema.Types.ObjectId;
    upi: {
        upiId: string,
        isActive: boolean
    };
    createdAt: Date;
    updatedAt: Date;
}

const adminSchema: Schema<AdminType> = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    upi: {
        upiId: { type: String, required: true },
        isActive: { type: Boolean, required: true }
    }
},
{
    timestamps: true
});

export default mongoose.models.Admin || mongoose.model<AdminType>("Admin", adminSchema);