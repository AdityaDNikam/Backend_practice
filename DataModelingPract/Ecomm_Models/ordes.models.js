import mongoose from "mongoose"
import { User } from "./user.models";

const OrderItemSchema = new mongoose.Schema({
    productQuantity: {
        type: Number,
        required: true,
        default: 1
    },
    ProductID: {
        type: mongoose.Schema.Type.ObjectId,
        ref: "Product"
    },
    User: {
        type: String,
        required: true
    }
})

const OrderSchema = new mongoose.Schema({
    orderPrice : {
        type : String,
        required : true,
        default : 0,
    },
    quantity : {
        type : ["OrderItemSchema"]
    },
    user : {
        type : mongoose.Schema.Type.ObjectId,
        ref : "User"
    },
    address : {
        type: String,
        required : true,
    },
    status : {
        type: String,
        enum : ["PENDING", "CANCELLED", "DELIVERED"],
        default : "PENDING"
    }
}, { timestamps: true });

export const Order = mongoose.model("Order", OrderSchema);