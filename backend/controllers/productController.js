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

// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.status(200).json({
//       products,
//     });
//   } catch (error) {
//     res.status(501).send("Error getting all products: " + error.message);
//   }
// };

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
