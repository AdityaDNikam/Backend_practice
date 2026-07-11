import { Router } from "express";
import { loginUser, reqisterUser, logoutUser, RefreshAccessToken } from "../controller/user.controller.js";
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

export default router