import mongoose from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
}, { timestamps: true })

export const Comment = mongoose.model("Comment", CommentSchema)