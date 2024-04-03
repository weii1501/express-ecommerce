const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dln7sory6",
  api_key: "512186482526577",
  api_secret: "AXDRhRBMdfjb5BxevMVg_QfWlqw",
});

const cloudinaryUploadImg = async (fileToUploads) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(fileToUploads, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(
          {
            url: result.secure_url,
          },
          {
            resource_type: "auto",
          }
        );
      }
    });
  });
};

module.exports = cloudinaryUploadImg;
