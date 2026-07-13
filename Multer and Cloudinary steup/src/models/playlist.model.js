import mongoose from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    video: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
}, { timestamps: true })

export const Playlist = mongoose.model("Playlist", playlistSchema)