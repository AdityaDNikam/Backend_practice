import mongoose from "mongoose"

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    catagory: {
        type: mongoose.Schema.Type.ObjectID,
        ref: "Catagory"
    },
    owner: {
        type: mongoose.Schema.Type.ObjectID,
        ref: "user"
    }
}, { timestamps: true })

export const Product = mongoose.model("Product", ProductSchema);