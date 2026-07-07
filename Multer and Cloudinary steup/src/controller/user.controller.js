import { asyncHandler } from "../utils/asyncHandler.js";

const reqisterUser = asyncHandler(async (req, res, next) => {
    res.status(200).json({ message: "User reqisterd successfully" })
})

export { reqisterUser }