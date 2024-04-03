const Product = require("../models/productModel");
const User = require("../models/userModel");
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

// const addToWishList = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const { prodId } = req.body;
//   try {
//     const user = await User.findById(_id);
//     // console.log(user);
//     const alreadyAdded = user.wishList.includes(
//       (id) => id.toString() === prodId
//     );
//     console.log(alreadyAdded);
//     if (alreadyAdded) {
//       let user = await User.findByIdAndUpdate(
//         _id,
//         {
//           $pull: { wishList: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       res.json(user);
//     } else {
//       let user = await User.findByIdAndUpdate(
//         _id,
//         {
//           $push: { wishList: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       res.json(user);
//     }
//   } catch (error) {
//     throw new Error(`Error in adding to wishlist: ${error}`);
//   }
// });

const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  console.log(prodId);
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.wishList.find((id) => id.toString() === prodId);
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishList: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishList: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const ratingProduct = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId, star, comment } = req.body;
  const product = await Product.findById(prodId);
  let alreadyRated = product.ratings.find(
    (user) => user.postedBy.toString() === _id.toString()
  );
  if (alreadyRated) {
    await Product.updateOne(
      {
        ratings: { $elemMatch: alreadyRated },
      },
      {
        $set: { "ratings.$.star": star, "ratings.$.comment": comment },
      },
      {
        new: true,
      }
    );
    // res.json(updateRate);
  } else {
    await Product.findByIdAndUpdate(
      prodId,
      {
        $push: {
          ratings: {
            star,
            comment,
            postedBy: _id,
          },
        },
      },
      {
        new: true,
      }
    );
  }
  const getallratings = await Product.findById(prodId);
  let totalRatings = getallratings.ratings.length;
  let ratingsum = getallratings.ratings
    .map((rating) => rating.star)
    .reduce((prev, curr) => prev + curr, 0);
  let actualRating = Math.round(ratingsum / totalRatings);
  let finalProduct = await Product.findByIdAndUpdate(
    prodId,
    {
      totalRating: actualRating,
    },
    {
      new: true,
    }
  );
  res.json(finalProduct);
});

const uploadImage = asyncHandler(async (req, res) => {
    console.log(req.files);
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  ratingProduct,
  uploadImage
};
