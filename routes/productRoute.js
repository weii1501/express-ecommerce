const express = require("express");
const router = express.Router();
const { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct } = require("../controller/productCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", getAllProduct);
router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/:id", getaProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;