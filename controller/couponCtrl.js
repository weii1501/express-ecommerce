const Coupon = require("../models/couponModel");
const validateMongodbid = require("../utils/validateMongodbid");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = new Coupon(req.body);
    await newCoupon.save();
    res.json({
      message: "Coupon created",
      coupon: newCoupon,
    });
  } catch (error) {
    throw new Error("Coupon not created");
  }
});

const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    throw new Error("Error in getting all coupons");
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json({
      message: "Coupon updated",
      coupon: coupon,
    });
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const deleteCoupon = await Coupon.findByIdAndDelete(id);
    res.json({
      message: "Coupon deleted",
      coupon: deleteCoupon,
    });
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
});

module.exports = {
  createCoupon,
  getAllCoupon,
  updateCoupon,
  deleteCoupon
};
