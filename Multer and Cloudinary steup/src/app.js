import cors from "cors"
import cookieParser from "cookie-parser"
import express, { urlencoded } from "express"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)

export { app }