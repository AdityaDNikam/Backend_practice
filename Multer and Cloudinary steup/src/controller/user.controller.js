import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { FileUploadCloudinary } from "../utils/cloudinary.js";
import ApiResponce from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const GenerateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.GenarateAccesstoken()
        const refreshToken = user.GenarateRefresh_token()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(400, "Error in generating Token, try again")
    }
}

const reqisterUser = asyncHandler(async (req, res, next) => {
    const { userName, email, password, fullname } = req.body
    // console.log(
    //     "Email:", email
    // )
    if ([userName, email, password, fullname].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are Mandatory")
    }
    const ExistingUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (ExistingUser) {
        throw new ApiError("400", "User with the username or email all ready exist!")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path

    let coverImgLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImgLocalPath = req.files.coverImage[0]?.path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is mandatory")
    }

    const avatar = await FileUploadCloudinary(avatarLocalPath)
    const coverImg = await FileUploadCloudinary(coverImgLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar is mandatory")
    }

    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        password,
        fullname,
        avatar: avatar.url,
        coverImage: coverImg?.url
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong")
    }

    return res.status(201).json(new ApiResponce(
        201,
        createdUser,
        "User registered successfully"
    ))

})

const loginUser = asyncHandler(async (req, res, next) => {
    const { userName, email, password } = req.body

    if (!(userName || email)) {
        throw new ApiError(400, "All email/username are Mandatory")
    }

    const user = await User.findOne({
        $or: [{ email }, { userName: userName?.toLowerCase() }]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const CorrectPassword = await user.isPassCorrect(password)

    if (!CorrectPassword) {
        throw new ApiError(401, "Invalid Credentials")
    }

    const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(user._id)
    //we performed this step as "user" that we earlier called from DB had no refrence of the access & refresh token!
    //hence to get the access of user with the tokens, we are making a new DB call!
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponce(
                {
                    loggedInUser, accessToken, refreshToken
                },
                200,
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findOneAndUpdate(
            req.user._id,
            {
                refreshToken: null
            }
        )

        const option = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).clearCookie("accessToken", option)
            .clearCookie("refreshToken", option)
            .json(new ApiResponce(200, {}, "User logged out successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong, Couldent logout")
    }

})

const RefreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const Raw_Incoming_Token = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(Raw_Incoming_Token?._id)

        if (!user) {
            throw new ApiError(404, "User not found!")
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const { accessToken, refreshToken: newRefreshToken } = await GenerateAccessAndRefreshToken(user._id)

        const option = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(
                new ApiResponce(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const Upadate_Password = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found!")
    }

    const CheckPassowrd = await user.isPassCorrect(oldPassword)

    if (!CheckPassowrd) {
        throw new ApiError(401, "Invalid Password!")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponce(200, {}, "Password changed successfully"))

})

const GetCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponce(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "Fullname and Email are mandatory fields")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { fullname, email } }, { new: true }).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponce(200, user, "Account details updated successfully"));

})

const updateAvatar = asyncHandler(async (req, res) => {
    const fileLocalPath = req.file?.path

    if (!fileLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await FileUploadCloudinary(fileLocalPath)

    if (!avatar.url) {
        throw new ApiError(500, "Failed to Upload File")
    }

    const updatedUser = await User.findByIdAndUpdate(req.user?._id, { $set: { avatar: avatar.url } }, { new: true }).select("-password -refreshToken")

    return res.status(200).json(new ApiResponce(200, updatedUser, "Avatar updated successfully"))


})

const updateCoverImg = asyncHandler(async (req, res) => {
    const fileLocalPath = req.file?.path

    if (!fileLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage = await FileUploadCloudinary(fileLocalPath)

    if (!coverImage.url) {
        throw new ApiError(500, "Failed to Upload File")
    }

    const updatedUser = await User.findByIdAndUpdate(req.user?._id, { $set: { coverImage: coverImage.url } }, { new: true }).select("-password -refreshToken")

    return res.status(200).json(new ApiResponce(200, updatedUser, "Cover image updated successfully"))


})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "No User name found")
    }
    //else run the below aggregation pipeline

    const channel = await User.aggregate([
        {
            $match: {
                userName: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "channelsSubscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubToCount: {
                    $size: "$channelsSubscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                userName: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelSubToCount: 1,
                isSubscribed: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "User not found!")
    }

    return res.status(200).json(new ApiResponce(200, channel[0], "Channel Profile fetched successfully"))
})

const getUserHistory = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id)

    const watchHistory = await User.aggregate([
        {
            $match: {
                _id: userId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        userName: 1,
                                        avatar: 1,
                                        _id: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$owner", 0] }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponce(200, watchHistory[0]?.watchHistory || [], "Watch history fetched successfully"))
})

export {
    RefreshAccessToken, reqisterUser, loginUser, logoutUser, Upadate_Password, GetCurrentUser,
    updateAvatar, updateCoverImg, updateAccountDetails, getUserChannelProfile, getUserHistory
}