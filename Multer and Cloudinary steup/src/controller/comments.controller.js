import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comments.model.js"
import { Video } from "../models/video.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)

    const comments = await Comment.find({ video: videoId })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("owner", "userName fullname avatar")

    return res
        .status(200)
        .json(new ApiResponce(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // destructure the request
    // chech for all the fields
    // create a db entry
    const { content } = req.body
    const { videoId } = req.params // Fixed destructuring from req.params

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        owner: req.user?._id,
        content,
        video: videoId
    })

    return res
        .status(201)
        .json(new ApiResponce(201, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Fixed object comparison to use string comparison
    if (comment.owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "You do not have permission to edit this comment")
    }

    comment.content = content
    await comment.save()

    return res
        .status(200)
        .json(new ApiResponce(200, comment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Fixed object comparison to use string comparison
    if (comment.owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "You do not have permission to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new ApiResponce(200, comment, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}