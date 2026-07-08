import { Router } from "express";
import { reqisterUser } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]
    ), reqisterUser)

export default router