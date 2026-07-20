import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/likes.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Get the channel stats: total videos, total views, total likes, total subscribers
    const channelId = req.user?._id

    if (!channelId) {
        throw new ApiError(401, "Unauthorized")
    }

    // Pipeline on Video collection: match this channel's videos, lookup likes, then group into totals
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        // For each video, grab all its likes from the "likes" collection
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        // Collapse ALL matched videos into a single summary document
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },                  // count each video
                totalViews: { $sum: "$views" },             // sum up all video views
                totalLikes: { $sum: { $size: "$likes" } }   // sum up likes across all videos
            }
        },
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1
            }
        }
    ])

    // Subscribers live in a separate collection — count them directly
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })

    // If the aggregation returned nothing, the channel has no videos yet
    const stats = videoStats[0] || { totalVideos: 0, totalViews: 0, totalLikes: 0 }
    stats.totalSubscribers = totalSubscribers

    return res
        .status(200)
        .json(new ApiResponce(200, stats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all videos uploaded by the channel
    const ownerId = req.user?._id

    if (!ownerId) {
        throw new ApiError(401, "Unauthorized")
    }

    const channelVideos = await Video.aggregate([
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