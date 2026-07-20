import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controller/comments.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

//get comments for particular video
router.route("/commentForVideo/:videoId").get(verifyJWT, getVideoComments)
//add comments
router.route("/addComment/:videoId").post(verifyJWT, addComment)
//update comments
router.route("/updateComment/:commentId").patch(verifyJWT, updateComment)
//delete comments
router.route("/deleteComment/:commentId").delete(verifyJWT, deleteComment)

export default router