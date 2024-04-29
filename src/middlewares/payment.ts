import QRCode from "qrcode"
import Admin from "../models/Admin.js";

// export const makePayment = async ({ totalAmount, transactionId, name, email, phone}:{totalAmount:number, transactionId:string, name:string, email: string, phone: number}) => {
//     const paymentOrder = await razorpayInstance.orders.create({
//         amount: totalAmount * 100,
//         currency: "INR",
//         receipt: transactionId,
//       });

//       return {
//         key: process.env.RAZORPAY_KEY_ID,
//         name: process.env.COMPANY_NAME,
//         currency: "INR",
//         amount: totalAmount * 100,
//         orderId: paymentOrder.id,
//         prefill:{
//           name: name,
//           email: email,
//           contact: phone,
//         },
//         theme: {
//           color: process.env.PRIMARY_COLOR
//         },
//         transactionId: transactionId
//       }
// }

export const makePayment = async ({ totalAmount, email}:{totalAmount:number, email: string}) => {
  const admin = await Admin.findOne({ "upi.isActive": true });
  const link = `upi://pay?pa=${admin?.upi?.upiId || process.env.ADMIN_UPI}&am=${totalAmount}&tn=${email}`
  const qrcode = await QRCode.toDataURL(link);
  return qrcode;
}