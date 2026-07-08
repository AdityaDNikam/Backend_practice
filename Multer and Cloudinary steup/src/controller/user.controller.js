import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { FileUploadCloudinary } from "../utils/cloudinary.js";
import ApiResponce from "../utils/ApiResponce.js";

const reqisterUser = asyncHandler(async (req, res, next) => {
    const { userName, email, password, fullname } = req.body
    console.log(
        "Email:", email
    )
    if ([userName, email, password, fullname].some(fields.trim() === "")) {
        return ApiError(400, "All fields are Mandatory")
    }
    const ExistingUser = User.findOne({
        $or: [{ userName }, { email }]
    })

    if (ExistingUser) {
        throw new ApiError("400", "User with the username or email all ready exist!")
    }
    const avatarLocalPath = req.files?.avatar[0]?.[path]
    const coverImgLocalPath = req.files?.coverImage[0]?.[path]

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

export { reqisterUser }