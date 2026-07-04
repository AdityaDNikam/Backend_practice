import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log("MongoDB connected successfully")
    } catch (error) {
        console.error("Error: ", error)
        throw error
    }
}

export default connectDB;