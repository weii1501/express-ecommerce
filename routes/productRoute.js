const express = require("express");
const router = express.Router();
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  ratingProduct,
  uploadImage,
} = require("../controller/productCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");

router.get("/", getAllProduct);
router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/add-to-wishlist", authMiddleware, addToWishList);
router.put("/rating", authMiddleware, ratingProduct);
router.put(
  "/upload",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 100),
  productImgResize,
  uploadImage
);
router.get("/:id", getaProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;
