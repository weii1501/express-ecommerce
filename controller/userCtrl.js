const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const validateMongodbid = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailCtrl");
const crypto = require("crypto");
const uniqid = require('uniqid'); 

const createUser = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  // console.log(findUser);
  if (!findUser) {
    // Create a new user
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } else {
    // User already exists
    throw new Error("User already exists");
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const findUser = await User.findOne({ email: email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    // res.json(findUser);
    const refreshToken = generateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(
      findUser?._id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // path: "/api/user/refreshToken",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser._id,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
      email: findUser.email,
      mobile: findUser.mobile,
      token: generateToken(findUser._id),
    });
  } else {
    throw new Error("Invalid email or password");
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const findAdmin = await User.findOne({ email: email });
  console.log(findAdmin);
  if (findAdmin?.role !== "admin") {
    throw new Error("You are not an admin");
  }
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    // res.json(findAdmin);
    const refreshToken = generateRefreshToken(findAdmin?._id);
    await User.findByIdAndUpdate(
      findAdmin?._id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // path: "/api/user/refreshToken",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin._id,
      firstname: findAdmin.firstname,
      lastname: findAdmin.lastname,
      email: findAdmin.email,
      mobile: findAdmin.mobile,
      token: generateToken(findAdmin._id),
    });
  } else {
    throw new Error("Invalid email or password");
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  // console.log(cookie);
  if (!cookie?.refreshToken) {
    throw new Error("No refresh token");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) {
    throw new Error("No refresh token in database or match");
  }
  // res.json(user)
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decode) => {
    // console.log(user._id !== decode.id);
    if (err || user.id !== decode.id) {
      throw new Error("there is an error in refresh token");
    }
    const accessToken = generateToken(user._id);
    res.json({
      accessToken,
    });
  });
});

// logout functionality
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No refresh token");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204);
  }
  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    throw new Error("Error in getting all users");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const getUser = await User.findById(id);
    res.json({ getUser });
  } catch (error) {
    console.log(error);
    throw new Error("Error in getting user by id");
  }
});

const deleteUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ deleteUser });
  } catch (error) {
    console.log(error);
    throw new Error("Error in deleting user by id");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongodbid(id);
  //   console.log(id);
  // console.log(req.body);
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      { new: true }
    );

    res.json({ updateUser });
  } catch (error) {
    console.log(error);
    throw new Error("Error in updating user by id");
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const blockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      { new: true }
    );
    res.json({
      message: "User is blocked",
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error in blocking user by id");
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const unblockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      { new: true }
    );
    res.json({
      message: "User is unblocked",
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error in unblocking user by id");
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = res.body;
  validateMongodbid(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    await user.save();
    res.json({
      message: "Password updated successfully",
    });
  } else {
    throw new Error("Password not updated");
  }
});

const forgetPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const token = await user.createPasswordResetToken();
    user.save({ validateBeforeSave: false });
    const resetUrl = `Hi, Please click on the link to reset your password: <a
      href="http://localhost:3000/api/user/reset-password/${token}"
    >Click here</a>`;
    const data = {
      to: email,
      subject: "Password reset link",
      text: "Hey guys",
      html: resetUrl,
    };
    // sendEmail(data, req, res);
    res.json({
      message: "Email sent successfully",
      token,
    });
  } catch (error) {
    throw new Error(`Error in sending email: ${error}`);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const haskedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: haskedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error("Token is invalid or expired");
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const getWishList = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("User not found, Please login first");
    }
    const { _id } = req.user;
    const user = await User.findById(_id).populate("wishList");
    res.json(user.wishList);
  } catch (error) {
    throw new Error(`Error in getting wishlist: ${error}`);
  }
});

const userCart = asyncHandler(async (req, res) => {
  // console.log(req.user);
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongodbid(_id);
  try {
    const products = [];
    const user = await User.findById(_id);
    // check if product is already in cart
    const alreadyExistCard = await Cart.findOne({ orderedBy: user._id });
    if (alreadyExistCard) {
      await alreadyExistCard.deleteOne();
    }
    for (let i = 0; i < cart.length; i++) {
      const product = await Product.findById(cart[i]._id);
      products.push({
        product: product._id,
        count: cart[i].count,
        color: cart[i].color,
        price: product.price,
      });
    }

    const cartTotal = products.reduce((acc, item) => {
      return acc + item.price * item.count;
    }, 0);

    // const totalAfterDiscount = cartTotal - cartTotal * (user?.discount / 100);
    const newCart = await new Cart({
      products,
      cartTotal,
      orderedBy: user._id,
    }).save();
    res.json(newCart);
    // console.log(products, cartTotal);
  } catch (error) {
    throw new Error(`Error in adding to cart: ${error}`);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbid(_id);
  try {
    const userCart = await Cart.findOne({ orderedBy: _id }).populate(
      "products.product",
      "_id title price"
    );
    res.json(userCart);
  } catch (error) {
    throw new Error(`Error in getting user cart: ${error}`);
  }
});

const emptyCard = asyncHandler(async (req, res) => {
  // console.log(req.user);
  const { _id } = req.user;
  validateMongodbid(_id);
  try {
    const userCart = await Cart.findOneAndDelete({ orderedBy: _id });
    if (!userCart) {
      throw new Error("Cart not found");
    }
    res.json({
      message: "Cart is empty",
      cart: userCart,
    });
  } catch (error) {
    throw new Error(`Error in getting user cart: ${error}`);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongodbid(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  // console.log(user._id.toString());
  const { cartTotal } = await Cart.findOne({
    orderedBy: user._id,
  }).populate("products.product");
  // console.log(cartTotal);
  const totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

const creataOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongodbid(_id);
  try {
    if (!COD) throw new Error("Create cash order failed");
    let userCart = await Cart.findOne({ orderedBy: _id });
    let finalAmount = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount * 100;
    } else {
      finalAmount = userCart.cartTotal * 100;
    }

    const newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmount,
        status: "Cash on delivery",
        created: Date.now(),
        currency: "usd",
      },
      orderedBy: _id,
      orderStatus: "Cash on delivery",
    }).save();

    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });

    const updated = await Product.bulkWrite(update, {});

    res.json({
      message: "Order created successfully",
      newOrder,
      updated,
    });
  } catch (error) {
    throw new Error(`Error in creating order: ${error}`);
  }
});

module.exports = {
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
  creataOrder
};
