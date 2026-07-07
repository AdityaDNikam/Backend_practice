import { Router } from "express";
import { reqisterUser } from "../controller/user.controller.js";

const router = Router()

router.route("/register").post(reqisterUser)

export default router