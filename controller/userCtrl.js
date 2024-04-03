const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongodbid = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailCtrl");
const crypto = require("crypto");

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
    res.sendStatus(204)
  }
  await User.findOneAndUpdate({ refreshToken: refreshToken }, {
    refreshToken: "",
  })
  res.clearCookie("refreshToken", {
    httpOnly: true, 
    secure: true,
  });
  res.sendStatus(204)
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
    }
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
  resetPassword
};
