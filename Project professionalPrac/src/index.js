import dotenv from "dotenv";
import express from "express"
import dns from "dns"
import connectDB from "./db/index.js";

dns.setServers(["8.8.8.8"]);

const app = express();

dotenv.config();

connectDB()