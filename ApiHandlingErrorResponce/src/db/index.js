import { mongoose } from "mongoose";
import { DB_NAME } from "../constants.js";

const DataBaseConnection = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`Connected to MongoDB: ${connection.connection.host}`)
    } catch (error) {
        console.log("Error orrurec was :", error)
    }
}

export default DataBaseConnection