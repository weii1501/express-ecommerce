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
  loginAdmin,
  getWishList,
  userCart,
  getUserCart,
  emptyCard,
  applyCoupon,
  creataOrder,
} = require("../controller/userCtrl");
const router = expess.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

// router.post("/apply-coupon",authMiddleware, applyCoupon)
router.post("/apply-coupon", authMiddleware, applyCoupon)
router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.post("/login-admin", loginAdmin);
router.get("/all-user", getAllUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.put("/update-user", authMiddleware, updateUserById);
router.get("/wishlist", authMiddleware, getWishList);
router.post("/cart",authMiddleware, userCart)
router.get("/cart",authMiddleware, getUserCart)
router.delete("/empty-cart",authMiddleware, emptyCard)
router.post("/cart-order", authMiddleware, creataOrder)
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.post("update-password", authMiddleware, updatePassword);
router.post("/forget-password-token", forgetPasswordToken);
router.post("/reset-password/:token", resetPassword);
router.get("/:id", authMiddleware, isAdmin, getUserById);
router.delete("/:id", deleteUserById);



module.exports = router;
