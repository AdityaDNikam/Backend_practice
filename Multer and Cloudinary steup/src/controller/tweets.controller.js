import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Tweet } from "../models/tweets.model.js";
import ApiResponce from "../utils/ApiResponce.js";
import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body || {}
    console.log("Content incoming", req.body)

    if (!content) {
        throw new ApiError(400, "All fields are Mandatory")
    }
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const tweet = await Tweet.create({
        owner: user._id,
        content: content
    })
    if (!tweet) {
        throw new ApiError(500, "Something went wrong, Please try again!")
    }
    return res.status(201).json(new ApiResponce(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    try {
        if (!userId) {
            throw new ApiError(400, "User id is missing")
        }

        const usertweets = await Tweet.find({ owner: userId })
        return res.status(201).json(new ApiResponce(201, usertweets, "User tweets fetched successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong, Please try again!")
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body || {}

    if (!tweetId) {
        throw new ApiError(400, "Tweet Id is missing")
    }
    if (!content) {
        throw new ApiError(400, "Some content is mandatory")
    }

    const tweetUpdate = await Tweet.findByIdAndUpdate(tweetId, { content })
    if (!tweetUpdate) {
        throw new ApiError(500, "Tweet not found")
    }
    return res.status(201).json(new ApiResponce(201, tweetUpdate, "Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(404, "Invalid Tweet Id, So tweet by this Id found")
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deleteTweet) {
        throw new ApiError(500, "Something went wrong while deleting")
    }

    return res.status(201).json(new ApiResponce(201, {
        "Deleted tweet id": deleteTweet._id
    }, "Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}