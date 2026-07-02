import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    description: { type: String },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subToDo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTodo"
    }]
}, { timestamps: true });

export const Todo = mongoose.model("Todo", TodoSchema);
