const BlogCat = require("../models/blogCatModel");
const asyncHandler = require("express-async-handler");
const validateMongodbid = require("../utils/validateMongodbid");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = new BlogCat(req.body);
    await newCategory.save();
    res.json({
      message: "Category created",
      newCategory: newCategory,
    });
  } catch (error) {
    throw new Error(`Category not created: ${error}`);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const updateCategory = await BlogCat.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updateCategory) {
      throw new Error("Category not found");
    }
    res.json({
      message: "Category updated",
      updateCategory: updateCategory,
    });
  } catch (error) {
    throw new Error(`Category not created: ${error}`);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const deleteCategory = await BlogCat.findByIdAndDelete(id);
    if (!deleteCategory) {
      throw new Error("Category not found");
    }
    res.json({
      message: "Category deleted",
      deleteCategory: deleteCategory,
    });
  } catch (error) {
    throw new Error(`Category not deleted: ${error}`);
  }
});

const getaCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const category = await BlogCat.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    res.json(category);
  } catch (error) {
    throw new Error(`Category not found: ${error}`);
  }
});

const getAllCategory = asyncHandler(async (req, res) => {
  try {
    const allCategory = await BlogCat.find();
    res.json(allCategory);
  } catch (error) {
    throw new Error(`Category not found: ${error}`);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getaCategory,
  getAllCategory,
};
