const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.baseUrl);
    if (req.baseUrl === "/api/product") {
      cb(null, path.join(__dirname, "../public/images/products/"));
    } else if (req.baseUrl === "/api/blog") {
      cb(null, path.join(__dirname, "../public/images/blogs/"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "Not an image! Please upload only images.",
        statusCode: 400,
      },
      false
    );
  }
};

const uploadPhoto = multer({
  storage: multerStorage,
  filter: multerFilter,
  limits: { fileSize: 2000000 },
});

const productImgResize = async (req, res, next) => {
  if (!req.file) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`);
    })
  );
  next();
};

const blogImgResize = async (req, res, next) => {
  if (!req.file) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
    })
  );
  next();
};

module.exports = {
  uploadPhoto,
  productImgResize,
  blogImgResize
};
