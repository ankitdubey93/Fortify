import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.MONGODB_URI as string;

export const connectDB = async () => {
  mongoose
    .connect(connectionString)
    .then(() => {
      console.log("CONNECTED TO THE DB.....");
    })
    .catch((err) => console.log("no connection to database", err));
};
