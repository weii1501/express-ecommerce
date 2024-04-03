const express = require('express');
const { createBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likedBlog, dislikedBlog } = require('../controller/blogCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();


router.post("/", authMiddleware, isAdmin, createBlog);
router.get("/", getAllBlog);
router.put("/likes", authMiddleware, likedBlog);
router.put("/dislikes", authMiddleware, dislikedBlog);
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);



module.exports = router;