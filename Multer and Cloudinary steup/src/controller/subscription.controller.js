import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user?._id
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    if (!userId) {
        throw new ApiError(400, "Invalid user ID")
    }

    if (userId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    const subIsAlredyExit = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if (subIsAlredyExit) {
        await Subscription.findByIdAndDelete(subIsAlredyExit._id)
        return res.status(200).json(new ApiResponce(200, {}, "Unsubscribed successfully"))
    } else {
        await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        return res.status(200).json(new ApiResponce(200, {}, "Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID")

    //Aggregate on subscription collection
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }
    ])

    if (!subscribers.length) throw new ApiError(404, "No Subscribers Yet")

    return res.status(200).json(new ApiResponce(200, subscribers, "Subscribers fetched successfully"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) throw new ApiError(400, "Invalid subscriber ID")

    //Aggregate on subscription collection
    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }
    ])

    if (!channels.length) throw new ApiError(404, "Channels not Subscribed")

    return res.status(200).json(new ApiResponce(200, channels, "Channels fetched successfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}