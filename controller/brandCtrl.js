const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongodbid = require("../utils/validateMongodbid");

const createBrand = asyncHandler(async (req, res) => {
  try {
    const newBrand = new Brand(req.body);
    await newBrand.save();
    res.json({
      message: "Brand created",
      newBrand: newBrand,
    });
  } catch (error) {
    throw new Error(`Brand not created: ${error}`);
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const updateBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updateBrand) {
      throw new Error("Brand not found");
    }
    res.json({
      message: "Brand updated",
      updateBrand: updateBrand,
    });
  } catch (error) {
    throw new Error(`Brand not created: ${error}`);
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const deleteBrand = await Brand.findByIdAndDelete(id);
    if (!deleteBrand) {
      throw new Error("Brand not found");
    }
    res.json({
      message: "Brand deleted",
      deleteBrand: deleteBrand,
    });
  } catch (error) {
    throw new Error(`Brand not deleted: ${error}`);
  }
});

const getaBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new Error("brand not found");
    }
    res.json(brand);
  } catch (error) {
    throw new Error(`Brand not found: ${error}`);
  }
});

const getAllBrand = asyncHandler(async (req, res) => {
  try {
    const allBrand = await Brand.find();
    res.json(allBrand);
  } catch (error) {
    throw new Error(`Brand not found: ${error}`);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getaBrand,
  getAllBrand,
};
