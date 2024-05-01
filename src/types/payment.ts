import { Types } from "mongoose";

export interface VerifyPaymentBodyType{
  paymentStatus: "success" | "failed" | "pending" | "processing",
  transactionId: string,
  userTransactionId: string,
  isFrom?: "subscription" | "shopping"
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

export interface VerifyPaymentRequestType{
    userId: string;
    transactionId: string;
    amount: number;
    isFrom?: "subscription" | "shopping";
}

export interface CancelPaymentType{
    transactionId: string;
}

export interface CreateSubscriptionType{
  userId: string,
  type: "basic" | "pro" | "premium",
  amount: number
}

export interface WithdrawalRequestType{
  userId: string,
  amount: number,
  upi: string
}