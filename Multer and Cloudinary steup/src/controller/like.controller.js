import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comments.model.js"
import { Tweet } from "../models/tweets.model.js"
import { Like } from "../models/likes.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video

    const { videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")
    if (!userId) throw new ApiError(400, "Invalid user ID")

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        owner: userId
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponce(200, {}, "Like removed successfully"))
    } else {
        await Like.create({
            video: videoId,
            owner: userId
        })
        return res.status(200).json(new ApiResponce(200, {}, "Like added successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment ID")
    if (!userId) throw new ApiError(400, "Invalid user ID")

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        owner: userId
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponce(200, {}, "Like removed successfully"))
    } else {
        await Like.create({
            comment: commentId,
            owner: userId
        })
        return res.status(200).json(new ApiResponce(200, {}, "Like added successfully"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID")
    if (!userId) throw new ApiError(400, "Invalid user ID")

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        owner: userId
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponce(200, {}, "Like removed successfully"))
    } else {
        await Like.create({
            tweet: tweetId,
            owner: userId
        })
        return res.status(200).json(new ApiResponce(200, {}, "Like added successfully"))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID")

    const likedVideos = await Like.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                { $project: { username: 1, avatar: 1 } }
                            ]
                        }
                    },
                    { $addFields: { owner: { $first: "$owner" } } }
                ]
            }
        },
        { $addFields: { videoDetails: { $first: "$videoDetails" } } },
        { $sort: { createdAt: -1 } }
    ])

    if (!likedVideos.length) {
        throw new ApiError(404, "No Liked Videos")
    }

    return res.status(200).json(new ApiResponce(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}