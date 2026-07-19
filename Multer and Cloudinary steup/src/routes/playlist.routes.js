import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controller/playlist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()
//create playlist
router.route("/create-playlist").post(verifyJWT, createPlaylist)
//get all playlists
router.route("/all-playlists").get(verifyJWT, getUserPlaylists)
//get playlist by id
router.route("/playlist/:playlistId").get(verifyJWT, getPlaylistById)
//add video to playlist
router.route("/add-video-to-playlist/:playlistId").post(verifyJWT, addVideoToPlaylist)
//remove video from playlist
router.route("/remove-video-from-playlist/:playlistId").post(verifyJWT, removeVideoFromPlaylist)
//delete playlist
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist)
//update playlist
router.route("/update-playlist/:playlistId").patch(verifyJWT, updatePlaylist)

export default router