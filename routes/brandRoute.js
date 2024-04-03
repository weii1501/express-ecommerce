const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createBrand, updateBrand, deleteBrand, getaBrand, getAllBrand } = require('../controller/brandCtrl');
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBrand);
router.get("/", getAllBrand)
router.get("/:id", getaBrand);
router.put("/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/:id", authMiddleware, isAdmin, deleteBrand);

module.exports = router;