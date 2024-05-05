import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadImageOnCloudinary = (file:any): Promise<{ url: string, public_id:string }> => {
  return new Promise(async (resolved, rejected) => {
    try {
        cloudinary.uploader
          .upload_stream({ folder: process.env.CLOUDINARY_FOLDER!, resource_type: "image"},(error, result) => {
              if (result) {
                  resolved(result);
              } else {
                console.error(error);
                rejected(error?.message);
              }
            }
          )
          .end(file);
    } catch (err:any) {
      console.log(err.message);
    }
  });
};

export const deleteImageOnCloudinary = (publicId:string): Promise<boolean> => {
  return new Promise(async (resolved, rejected) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        resolved(true);
    } catch (err:any) {
      console.log(err.message);
      rejected(false);
    }
  });
};