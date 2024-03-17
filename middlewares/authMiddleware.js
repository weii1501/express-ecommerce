const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      try {
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded?.id);
          req.user = user;
          next();
        }
      } catch {
        // res.status(401);
        throw new Error("Not authorized, token failed");
      }
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  console.log(email);
  try {
    const adminUser = await User.findOne({ email: email });
    if (adminUser?.role === "admin") {
      next();
    } else {
      throw new Error("Not authorized as an admin");
    }
  } catch (error) {
    // res.status(401);
    throw new Error("Not authorized as an admin");
  }
});

module.exports = {
  authMiddleware,
  isAdmin,
};
