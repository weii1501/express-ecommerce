const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { createAddress, updateAddress, deleteAddress, getAllAddress, getaAddress } = require("../controller/addressCtrl");
const router = express.Router();

router.post("/", authMiddleware, createAddress);
router.put("/:id", authMiddleware, updateAddress);
router.get("/", authMiddleware, getAllAddress);
router.delete("/:id", authMiddleware, deleteAddress);

router.get("/:id", authMiddleware, getaAddress);

module.exports = router;