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
        const responceUpload = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        console.log("File Upload Successfull", responceUpload.url)
        fs.unlinkSync(localFilePath)
        return responceUpload;

    } catch (error) {
        console.error("Cloudinary upload failed error details:", error)
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null
    }
}

const FileDeleteCloudinary = async (coverImagePublicIdFromDB) => {
    try {
        const responceDelete = await cloudinary.uploader.destroy(coverImagePublicIdFromDB);
        console.log("File delete successfull", responceDelete)
        return responceDelete;
    } catch (error) {
        console.error("Cloudinary delete failed error details:", error)
        return null
    }

}

export { FileUploadCloudinary, FileDeleteCloudinary } 