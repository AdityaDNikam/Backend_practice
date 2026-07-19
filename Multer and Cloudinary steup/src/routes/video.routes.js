import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controller/video.controller.js";
import { upload } from "../middleware/multer.js"
import { verifyJWT } from "../middleware/auth.middleware.js"


const router = Router()
//get All Videos
router.route("/all-videos").get(getAllVideos)

//publish Video
router.route("/publish-video").post(verifyJWT, upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]
), publishAVideo)

//get video by id
router.route("/video/:videoId").get(getVideoById)

//update video
router.route("/update-video/:videoId").patch(verifyJWT, upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videoFile", maxCount: 1 }
]), updateVideo)

//delete video
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo)

//toggle publish status
router.route("/toggle-publish-status/:videoId").patch(verifyJWT, togglePublishStatus)

export default router