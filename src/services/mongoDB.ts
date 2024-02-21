import mongoose from "mongoose";

export const connectToMongo = (): void => {
  try {
    mongoose.connect("mongodb://localhost:27017").then(() => {
      console.log("database connected....");
    });
  } catch (error) {
    console.log(error);
  }
};