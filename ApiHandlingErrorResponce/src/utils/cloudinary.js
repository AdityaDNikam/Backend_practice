import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
)

const FileUploadCloudinary = async (localFilePath) => {
    try {
        const responce = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        console.log("File Upload Successfull", responce.url)
        return responce;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null

    }
}

export { FileUploadCloudinary }