import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponce.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user?._id

    //TODO: create playlist
    if (!userId) throw new ApiError(400, "Invalid user ID")
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })

    return res.status(200).json(new ApiResponce(200, playlist, "Playlist created successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID")
    if (!userId) throw new ApiError(400, "Invalid user ID")

    const playlist = await Playlist.find({
        owner: userId
    })

    if (!playlist.length) {
        throw new ApiError(404, "No playlists found")
    }

    return res.status(200).json(new ApiResponce(200, playlist, "Playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    if (!playlistId) throw new ApiError(400, "Invalid playlist ID")

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponce(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    //TODO: add video to playlist

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")
    if (!playlistId) throw new ApiError(400, "Invalid playlist ID")
    if (!videoId) throw new ApiError(400, "Invalid video ID")

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const playlistVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                video: videoId
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(new ApiResponce(200, playlistVideo, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")
    if (!playlistId) throw new ApiError(400, "Invalid playlist ID")
    if (!videoId) throw new ApiError(400, "Invalid video ID")

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const playlistVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                video: videoId
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(new ApiResponce(200, playlistVideo, "Video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    if (!playlistId) throw new ApiError(400, "Invalid playlist ID")

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const playlistVideo = await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(new ApiResponce(200, playlistVideo, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    if (!playlistId) throw new ApiError(400, "Invalid playlist ID")

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const playlistVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        {
            new: true
        }
    )

    return res.status(200).json(new ApiResponce(200, playlistVideo, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}