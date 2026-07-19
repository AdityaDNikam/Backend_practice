import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controller/like.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()




export default router
