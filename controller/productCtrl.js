const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (error) {
    throw new Error("Product not created");
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(product);
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.json({
      message: "Product deleted",
      product: deleteProduct
    });
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    res.json(product);
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    throw new Error("Products not found");
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct
};
