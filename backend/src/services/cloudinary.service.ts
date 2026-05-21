import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type UploadResult = {
  secure_url: string;
  url?: string;
  public_id?: string;
};

export const uploadBufferToCloudinary = (buffer: Buffer, folder: string, publicId: string): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder,
        public_id: publicId,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        // result can be undefined in typings — cast to any
        resolve(result as unknown as UploadResult);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export default cloudinary;
