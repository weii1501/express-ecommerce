const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createCategory, updateCategory, deleteCategory, getaCategory, getAllCategory } = require('../controller/blogCatCtrl');
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createCategory);
router.get("/", getAllCategory)
router.get("/:id", getaCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);

module.exports = router;