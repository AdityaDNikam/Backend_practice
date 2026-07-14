import { Router } from "express";
import {
    loginUser, reqisterUser, logoutUser, RefreshAccessToken, Upadate_Password, updateAvatar, updateCoverImg,
    GetCurrentUser, updateAccountDetails, getUserHistory, getUserChannelProfile, deleteCoverImg
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]
    ), reqisterUser)

router.route("/login").post(loginUser)

//secure route
router.route("/logout").post(verifyJWT, logoutUser)

//refresh token 
router.route("/refresh-token").post(RefreshAccessToken)

//update password
router.route("/update-password").post(verifyJWT, Upadate_Password)

//update avatar
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)

//update cover image
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImg)

//delete Cover image
router.route("/delete-cover-image").delete(verifyJWT, deleteCoverImg)

//get current user
router.route("/current-user").get(verifyJWT, GetCurrentUser)

//update account detail
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

//get user watch history
router.route("/history").get(verifyJWT, getUserHistory)

//get user channel profile
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)


export default router