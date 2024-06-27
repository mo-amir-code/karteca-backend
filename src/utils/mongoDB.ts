import mongoose from "mongoose";
import { MONGO_URI } from "./constants.js";

export const connectToMongo = (): void => {
  try {
    mongoose.connect(MONGO_URI || "").then(() => {
      console.log("database connected....");
    });
  } catch (error) {
    console.log(error);
  }
};