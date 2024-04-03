const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const dbConnect = require('./config/dbConnect');
const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute');
const blogRoute = require('./routes/blogRoute');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const prodcategoryRoute = require('./routes/prodcategoryRoute');
const blogCatRoute = require('./routes/blogCatRoute');
const brandRoute = require('./routes/brandRoute');
const couponRoute = require('./routes/couponRoute');

dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/user', authRoute);
app.use('/api/product', productRoute);
app.use('/api/blog', blogRoute);
app.use('/api/category', prodcategoryRoute);
app.use('/api/blogcategory', blogCatRoute);
app.use('/api/brand', brandRoute);
app.use('/api/coupon', couponRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// module.exports = app;
