const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const { BASE_URL } = require("../constants");

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
      product: deleteProduct,
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
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(queryStr);
    let query = Product.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const totalProducts = await Product.countDocuments();
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit || totalProducts;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalProducts / limit);
    let nextPage = null;
    let prevPage = null;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      //   const numProducts = await Product.countDocuments();
      if (skip >= totalProducts) throw new Error("This page does not exist");
      if (page < totalPage) {
        nextPage = `${BASE_URL}/api/products?page=${page + 1}&limit=${limit}`;
      }
      if (page > 1) {
        prevPage = `${BASE_URL}/api/products?page=${page - 1}&limit=${limit}`;
      }
    }

    const products = await query;

    res.json({
      totalPage,
      totalProducts,
      currentPage: page,
      limit,
      nextPage,
      prevPage,
      products,
    });
  } catch (error) {
    throw new Error("Products not found");
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
};
