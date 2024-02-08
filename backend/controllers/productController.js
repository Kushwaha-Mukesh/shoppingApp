const Product = require("../models/product");
const WhereClause = require("../utils/whereClause");
const cloudinary = require("cloudinary").v2;

exports.addProduct = async (req, res) => {
  try {
    let imageArray = [];
    if (!req.files) {
      res.status(301).send("Product images are required.");
      return;
    }

    if (req.files) {
      for (let i = 0; i < req.files.photos.length; i++) {
        let result = await cloudinary.uploader.upload(
          req.files.photos[i].tempFilePath,
          {
            folder: "products",
          }
        );

        imageArray.push({
          id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).send("Error creating product: " + error.message);
  }
};

// admin can visit below route to get all products but industry standard to create separate route.
exports.adminGetAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      res.status(301).send("No products available");
      return;
    }
    res.status(200).json({
      products,
    });
  } catch (error) {
    res.status(501).send("Error getting all products: " + error.message);
  }
};

// users accessing all the products.
exports.getAllProducts = async (req, res) => {
  try {
    const resultPerPage = 6;

    // here crateDocuments gives the no.of data avialable in product document.
    const countProduct = await Product.countDocuments();

    const productsObj = new WhereClause(Product.find(), req.query)
      .search()
      .filter();

    let products = await productsObj.base;
    const fileredProductNo = products.length;

    productsObj.pager(resultPerPage);

    // whenever we do chained query we use clone() method.
    products = await productsObj.base.clone();

    res.status(200).json({
      success: true,
      products,
      fileredProductNo,
      totalProducts: countProduct,
    });
  } catch (error) {
    res.status(501).send("error getting all products: " + error.message);
  }
};

// get one product
exports.getOneProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).send("No product found!");
      return;
    }
    res.status(200).json({
      product,
    });
  } catch (error) {
    res
      .status(501)
      .send("error while getting single product: " + error.message);
  }
};

exports.adminUpdateOneProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).send("Product is not available.");
      return;
    }

    // console.log(req.files.photos);

    if (req.files) {
      let imageArray = [];
      // destroy images
      for (let i = 0; i < product.photos.length; i++) {
        await cloudinary.uploader.destroy(product.photos[i].id);
      }

      // upload and save the images
      for (let i = 0; i < req.files.photos.length; i++) {
        let result = await cloudinary.uploader.upload(
          req.files.photos[i].tempFilePath,
          {
            folder: "products", // we can have folder name in .env file.
          }
        );

        imageArray.push({
          id: result.public_id,
          secure_url: result.secure_url,
        });
      }
      req.body.photos = imageArray;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(501).send("Error while updating one product: " + error.message);
  }
};

exports.adminDeleteOneProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).send("Product not found");
      return;
    }
    for (let i = 0; i < product.photos.length; i++) {
      await cloudinary.uploader.destroy(product.photos[i].id);
    }
    const result = await Product.findByIdAndDelete(req.params.id);
    res.status(200).send("Product - " + result.name + " deleted successfully!");
  } catch (error) {
    res.status(500).send("Error while deleting one product: " + error.message);
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
    const product = await Product.findById(productId);
    const AlreadyReview = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );
    if (AlreadyReview) {
      product.reviews.forEach((review) => {
        if (review.user.toString() === req.user._id.toString()) {
          (review.comment = comment), (review.rating = rating);
        }
      });
    } else {
      product.reviews.push(review);
      product.numberOfReviews = product.reviews.length;
    }
    product.ratings = Math.round(
      product.reviews.reduce((acc, review) => review.rating + acc, 0) /
        product.reviews.length
    );
    await product.save({ validateBeforeSave: false });
    res.status(200).send("Review added successfully!");
  } catch (error) {
    res.status(501).send("Error while adding review: " + error.message);
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    const reviews = product.reviews.filter(
      (review) => review.user.toString() !== req.user._id.toString()
    );
    const numberOfReviews = reviews.length;
    let ratings = 0;
    if (numberOfReviews !== 0) {
      ratings = Math.round(
        reviews.reduce((acc, review) => acc + review.rating, 0) /
          numberOfReviews
      );
    }

    await Product.findByIdAndUpdate(
      productId,
      {
        reviews,
        ratings: ratings,
        numberOfReviews,
      },
      { new: true, runValidators: true }
    );
    res.status(200).send("Review deleted!");
  } catch (error) {
    res.status(501).send("Error while deleting review: " + error.message);
  }
};

exports.getReviewsOneProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    res
      .status(501)
      .send("error while getting reviews of one product: " + error.message);
  }
};
