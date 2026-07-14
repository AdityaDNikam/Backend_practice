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
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}