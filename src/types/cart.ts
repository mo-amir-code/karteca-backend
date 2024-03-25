import { Schema } from "mongoose";

export interface APICartType{
    userId: Schema.Types.ObjectId,
    product: Schema.Types.ObjectId,
    color?: string,
    discount: number,
    quantity: number,
    currentPrice: number,
    totalAmount: number,
}