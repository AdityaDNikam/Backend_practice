import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controller/like.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

//toggle like on video
router.route("/toggleVideoLike/:videoId").post(verifyJWT, toggleVideoLike)
//toggle like on comment
router.route("/toggleCommentLike/:commentId").post(verifyJWT, toggleCommentLike)
//toggle like on tweet
router.route("/toggleTweetLike/:tweetId").post(verifyJWT, toggleTweetLike)
//get liked videos
router.route("/getLikedVideos").get(verifyJWT, getLikedVideos)

export default router
