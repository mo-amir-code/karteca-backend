import mongoose from "mongoose";

export const connectToMongo = (): void => {
  try {
    mongoose.connect(process.env.MONGO_URI || "").then(() => {
      console.log("database connected....");
    });
  } catch (error) {
    console.log(error);
  }
};