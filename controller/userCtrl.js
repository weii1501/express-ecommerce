const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

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
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ deleteUser });
  } catch (error) {
    console.log(error);
    throw new Error("Error in deleting user by id");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
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

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUser,
  getUserById,
  deleteUserById,
  updateUserById,
};
