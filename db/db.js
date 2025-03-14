import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const MONGODB_URL = process.env.MONGODB_CONNECTION_STRING;
export const connectDB = async () => {
  // try {
  //   const connection = await mongoose.connect(MONGODB_URL);
  //   console.log("DB is connected");
  //   // console.log(mongoose);
  // } catch (error) {
  //   console.log(error?.message);
  //   process.exit(1);
  // }
  mongoose.connect(MONGODB_URL);
  mongoose.connection.on("connected", () => {
    console.log("Mongo DB is connected");
  });

  mongoose.connection.on("error", (error) => {
    console.log("Mongo DB connection error", error?.message);
    process.exit(1);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("Mongo DB is disconnected");
  });
};
