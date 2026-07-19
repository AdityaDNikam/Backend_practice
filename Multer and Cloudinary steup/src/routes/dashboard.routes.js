import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos
} from "../controller/dashboard.conrtoller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
