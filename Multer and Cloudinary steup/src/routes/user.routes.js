import { Router } from "express";
import { loginUser, reqisterUser, logoutUser, RefreshAccessToken, Upadate_Password, updateAvatar, updateCoverImg, GetCurrentUser, updateAccountDetails } from "../controller/user.controller.js";
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
router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateAvatar)

//update cover image
router.route("/update-cover-image").post(verifyJWT, upload.single("coverImage"), updateCoverImg)

//get current user
router.route("/current-user").get(verifyJWT, GetCurrentUser)

//update account details
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

export default router