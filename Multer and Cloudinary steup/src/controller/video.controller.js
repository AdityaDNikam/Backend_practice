import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middleware/multer.js";
import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"
import { FileUploadCloudinary, FileDeleteCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    console.log("route for getting all videos")
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {

    // TODO: get video, upload to cloudinary, create video
    // Video Upload is handled by multer, post the verifyJWT
    // Video Url from cloudinary passed by multer
    // Get thumbnail, discription, publish value, Cloudinary Url and title from req.body
    // create a db entry, using the above details
    // send responce
    const { title, description, isPublished = true } = req.body

    if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    // Upload video and thumbnail to Cloudinary
    const videoFile = await FileUploadCloudinary(videoFileLocalPath)
    const thumbnail = await FileUploadCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(500, "Failed to upload video file to Cloudinary")
    }

    if (!thumbnail) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary")
    }

    const video = await Video.create({
        title,
        description,
        isPublished,
        duration: videoFile.duration, // Grab duration from Cloudinary response
        videoFile: videoFile.url,     // Cloudinary URL
        thumbnail: thumbnail.url,     // Cloudinary URL
        owner: req.user?._id
    })

    return res
        .status(201)
        .json(new ApiResponce(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //get the video id from params
    //make a DB call to get the video details
    //send the details back

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const videoById = await Video.findById(videoId)

    if (!videoById) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponce(200, videoById, "Video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    //TODO: update video details like title, description, thumbnail
    //get the id from the params
    //maka a db call to get and update the video file
    //Handle the thumbnail on cloudnary
    //delete the prev thumbnail
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Authorization check: only the owner can update the video
    if (req.user?._id?.toString() !== video?.owner?.toString()) {
        throw new ApiError(403, "You do not have permission to update this video")
    }

    // 1. Conditional text updates: update only if fields are provided and not empty
    if (title && title.trim() !== "") {
        video.title = title
    }
    if (description && description.trim() !== "") {
        video.description = description
    }

    // 2. Conditional thumbnail update (if a new file is uploaded)
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    if (thumbnailLocalPath) {
        // Upload new thumbnail to Cloudinary
        const newThumbnail = await FileUploadCloudinary(thumbnailLocalPath)
        if (!newThumbnail?.url) {
            throw new ApiError(500, "Failed to upload new thumbnail")
        }

        // Delete old thumbnail from Cloudinary (extracting publicId from URL)
        if (video.thumbnail) {
            const oldThumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0]
            await FileDeleteCloudinary(oldThumbnailPublicId)
        }

        video.thumbnail = newThumbnail.url
    }

    // 3. Conditional videoFile update (if a new file is uploaded)
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    if (videoFileLocalPath) {
        // Upload new video to Cloudinary
        const newVideoFile = await FileUploadCloudinary(videoFileLocalPath)
        if (!newVideoFile?.url) {
            throw new ApiError(500, "Failed to upload new video file")
        }

        // Delete old video file from Cloudinary (extracting publicId from URL)
        if (video.videoFile) {
            const oldVideoPublicId = video.videoFile.split("/").pop().split(".")[0]
            await FileDeleteCloudinary(oldVideoPublicId, "video")
        }

        video.videoFile = newVideoFile.url
        video.duration = newVideoFile.duration // Automatically update the video duration!
    }

    const updatedVideo = await video.save()

    return res
        .status(200)
        .json(new ApiResponce(200, updatedVideo, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    //get video from params
    //delete the video
    //send responce!
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Authorization check: only the owner can delete the video
    if (req.user?._id?.toString() !== video.owner?.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video")
    }

    // Delete from DB first
    await Video.findByIdAndDelete(videoId)

    // Delete files from Cloudinary
    if (video.videoFile) {
        const oldVideoPublicId = video.videoFile.split("/").pop().split(".")[0]
        await FileDeleteCloudinary(oldVideoPublicId, "video")
    }

    if (video.thumbnail) {
        const oldThumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0]
        await FileDeleteCloudinary(oldThumbnailPublicId, "image")
    }

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Authorization check: only the owner can toggle publish status
    if (req.user?._id?.toString() !== video.owner?.toString()) {
        throw new ApiError(403, "You do not have permission to toggle publish status for this video")
    }

    video.isPublished = !video.isPublished
    const updatedVideo = await video.save()

    return res
        .status(200)
        .json(new ApiResponce(200, updatedVideo, "Publish status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}