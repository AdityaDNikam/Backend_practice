import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
)

const uploadVideo = async (localFilePath) => {
    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'video',
            folder: 'user_videos',
        });
        console.log('Upload successful:', result.secure_url);
        console.log('Public ID to save in DB:', result.public_id);
        return result;

    } catch (error) {
        console.error('Video upload failed:', error);
        throw error;
    }
};

const deleteVideo = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video',
            invalidate: true
        });

        console.log('Deletion result:', result);
        return result;

    } catch (error) {
        console.error('Video deletion failed:', error);
        throw error;
    }
};

export { uploadVideo, deleteVideo }