import { Router } from "express";
import { upload } from "../middleware/multer.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { createTweet, getUserTweets, updateTweet, deleteTweet } from "../controller/tweets.controller.js"

const router = Router()

//create tweet
router.route("/create-tweet").post(verifyJWT, createTweet)

//get user tweet
router.route("/get-user-tweets/:userId").get(verifyJWT, getUserTweets)

//update tweet
router.route("/update-tweet/:tweetId").patch(verifyJWT, updateTweet)

//delete tweet
router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet)

export default router