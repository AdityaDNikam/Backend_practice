import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/likes.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // 
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { ownerId } = req.user?._id
    if (!ownerId) {
        throw new ApiError(404, "User not found")
    }

    const channelVideos = await Video.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(ownerId)
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    isPublished: 1,
                    createdAt: 1,
                    likesCount: 1
                }
            }
        ])

    if (!channelVideos.length) {
        throw new ApiError(404, "Videos not found")
    }

    return res
        .status(200)
        .json(new ApiResponce(200, channelVideos, "Videos fetched successfully"))

})

export {
    getChannelStats,
    getChannelVideos
}