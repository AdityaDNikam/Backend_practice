import DataBaseConnection from "./db/index.js"
import dotenv from "dotenv"
import { app } from "./app.js"


dotenv.config()

DataBaseConnection()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    }
    ).catch(error => {
        console.log("Error connecting to database", error)
        process.exit(1)
    })