const User = require("../models/userModel");
const Address = require("../models/addressModel");
const asyncHandler = require("express-async-handler");
const validateMongodbid = require("../utils/validateMongodbid");

const createAddress = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const newAddress = await new Address(req.body);
    newAddress.save();
    const user = await User.findByIdAndUpdate(
      id,
      { $push: { address: newAddress } },
      { new: true }
    ).populate("address");
    res.json({
      message: "Address created",
      newAddress: newAddress,
      user: user,
    });
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
});

const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const user = await User.findById(userId);
  const address = user.address.find((address) => address._id == id);
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }
  validateMongodbid(id);
  try {
    const updatedAddress = await Address.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({
      message: "Address updated",
      updateAddress: updatedAddress,
    });
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const user = await User.findById(userId);
  const address = user.address.find((address) => address._id == id);
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }
  validateMongodbid(id);
  try {
    const deletedAddress = await Address.findByIdAndDelete(id);
    if (!deletedAddress) {
      res.status(404);
      throw new Error("Address deleted failed");
    }
    res.json({
      message: "Address deleted",
      deletedAddress: deletedAddress,
    });
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
});

const getAllAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate("address");
  res.json(user.address);
});

const getaAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);
    const address = user.address.find((address) => address._id == id);
    if (!address) {
      res.status(404);
      throw new Error("Address not found");
    }
    validateMongodbid(id);
    try {
      const getAddress = await Address.findById(id);
      res.json({
        message: "Address found",
        getAddress: getAddress,
      });
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
});

module.exports = {
  createAddress,
  updateAddress,
  deleteAddress,
  getAllAddress,
  getaAddress
};
