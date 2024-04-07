import { Types } from "mongoose";

export interface VerifyPaymentBodyType{
    orderId: string,
    paymentId: string,
    signature: string,
    transactionId: string,
    isFrom?: "refer" | "main"
}

export interface PaymentTransactionType{
  userId: Types.ObjectId;
  type: "withdrawal" | "credit" | "spend";
  mode: "referral" | "giftCard" | "shopping";
  paymentId: string,
  paymentOrderId: string,
  paymentSignature: string;
  amount: number;
  status: "pending" | "processing" | "failed" | "success"
}