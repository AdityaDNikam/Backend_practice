import { mongoose } from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv"
dotenv.config({ path: "./.env" })

const DataBaseConnection = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`Connected to MongoDB: ${connection.connection.host}`)
    } catch (error) {
        console.log("Error has occured:", error)
        throw error;
    }
}

export default DataBaseConnection