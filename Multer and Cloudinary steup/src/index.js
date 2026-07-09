import "dotenv/config"
import dns from "dns"
import DataBaseConnection from "./db/index.js"
import { app } from "./app.js"

// Configure fallback public DNS resolver to solve Atlas SRV lookup issues
dns.setServers(["8.8.8.8", "8.8.4.4"])

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