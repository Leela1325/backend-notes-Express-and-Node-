import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const connectDB = async () => {
  try {
    const conn=await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
  
      console.log(` MongoDB connected: ${conn.connection.name}`)
    console.log(`mongo db connected on ${process.env.MONGODB_URI}`);
   
    
  } catch (error) {
    console.log("error", error);
    process.exit(1);
  }
};

export default connectDB;
