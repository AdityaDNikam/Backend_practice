import mongoose from "mongoose"

const CatagorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true})

export const Catagory = mongoose.model("Catagory", CatagorySchema);

