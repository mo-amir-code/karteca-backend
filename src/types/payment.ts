
export interface VerifyPaymentBodyType{
    orderId: string,
    paymentId: string,
    signature: string,
    transactionId: string
}