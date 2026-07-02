import mongoose from "mongoose";

const SubTodoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo"
    }
}, { timestamps: true });

export const SubTodo = mongoose.model("SubTodo", SubTodoSchema);