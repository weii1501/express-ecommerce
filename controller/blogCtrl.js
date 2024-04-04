const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongodbid = require("../utils/validateMongodbid");
const { BASE_URL } = require("../constants");
const cloudinaryImgUpload = require("../utils/cloudinary");
const fs = require("fs");

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.json({
      message: "Blog created",
      newBlog: newBlog,
    });
  } catch (error) {
    throw new Error(`Blog not created: ${error}`);
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  // console.log(id);
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    //   await updatedBlog.save();
    res.json({
      message: "Blog upadated",
      updateBlog: updatedBlog,
    });
  } catch (error) {
    throw new Error(`Blog not created: ${error}`);
  }
});

const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    // const blog = await Blog.findById(id);
    const updateViews = await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(updateViews);
  } catch (error) {
    throw new Error(`getBlog Error: ${error}`);
  }
});

const getAllBlog = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Blog.find(JSON.parse(queryStr));

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
    const totalBlogs = await Blog.countDocuments();
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit || totalBlogs;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalBlogs / limit);
    let nextPage = null;
    let prevPage = null;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      if (skip >= totalBlogs) {
        throw new Error("This page does not exist");
      }

      if (page < totalPage) {
        nextPage = `${BASE_URL}/api/blogs?page=${page + 1}&limit=${limit}`;
      }

      if (page > 1) {
        prevPage = `${BASE_URL}/api/blogs?page=${page - 1}&limit=${limit}`;
      }
    }

    const blogs = await query
      .populate("likes", "_id email firstname lastname")
      .populate("dislikes", "_id email firstname lastname");
    res.json({
      totalPage,
      totalBlogs,
      currentPage: page,
      limit,
      nextPage,
      prevPage,
      blogs,
    });
  } catch (error) {
    throw new Error(`Error in getting all blogs: ${error}`);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const deleteBlog = await Blog.findByIdAndDelete(id);
    res.json({ deleteBlog });
  } catch (error) {
    throw new Error("Error in deleting blog by id");
  }
});

const likedBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongodbid(blogId);

  // find the blog you want to like
  const blog = await Blog.findById(blogId);
  // find login user
  //   console.log(req?.user?.id);
  const loginUserId = req?.user?.id;
  // console.log(loginUserId)
  // find user who liked the blog
  const isLiked = blog?.isLiked;

  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId.toString() === loginUserId.toString()
  );
  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    // res.json(blog);
  }

  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});

const dislikedBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongodbid(blogId);

  // find the blog you want to like
  const blog = await Blog.findById(blogId);
  // find login user
  //   console.log(req?.user?.id);
  const loginUserId = req?.user?.id;
  // console.log(loginUserId)
  // find user who liked the blog
  const isDisliked = blog?.isDisliked;

  const alreadyLiked = blog?.likes?.find(
    (userId) => userId.toString() === loginUserId.toString()
  );
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    // res.json(blog);
  }

  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});

const uploadImage = asyncHandler(async (req, res) => {
  console.log(req.files);
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const uploader = (path) => cloudinaryImgUpload(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      // fs.unlinkSync(path);
    }
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      }
    );
    console.log(findBlog);
    res.json(findBlog);
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likedBlog,
  dislikedBlog,
  uploadImage,
};
