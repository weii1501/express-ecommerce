const expess = require("express");
const {
  createUser,
  loginUserCtrl,
  getAllUser,
  getUserById,
  deleteUserById,
  updateUserById,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgetPasswordToken,
  resetPassword,
} = require("../controller/userCtrl");
const router = expess.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/all-user", getAllUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.put("/update-user", authMiddleware, updateUserById);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.post("update-password", authMiddleware, updatePassword);
router.post("/forget-password-token", forgetPasswordToken);
router.post("/reset-password/:token", resetPassword);
router.get("/:id", authMiddleware, isAdmin, getUserById);
router.delete("/:id", deleteUserById);



module.exports = router;
