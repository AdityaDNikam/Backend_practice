import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { FileUploadCloudinary } from "../utils/cloudinary.js";
import ApiResponce from "../utils/ApiResponce.js";


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
    const { userName, email, passsword } = req.body

    if (!userName || !email) {
        throw new ApiError(400, "All email/username are Mandatory")
    }

    const user = await User.findOne({
        $or: [{ email }, { userName: userName.toLowerCase() }]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const CorrectPassword = await user.isPassCorrect(passsword)

    if (!CorrectPassword) {
        throw new ApiError(401, "Invalid Credentials")
    }

    const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(user._id)

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
                200,
                loggedInUser,
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

export { reqisterUser, loginUser, logoutUser }