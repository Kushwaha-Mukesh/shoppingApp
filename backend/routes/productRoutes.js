const express = require("express");
const {
  addProduct,
  getAllProducts,
  adminGetAllProducts,
  getOneProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  addReview,
  deleteReview,
  getReviewsOneProduct,
} = require("../controllers/productController");
const { isLoggedIn, role } = require("../middlewares/userMiddleware");
const router = express.Router();

// user routes
router.route("/products").get(getAllProducts);
router.route("/single/:id").get(getOneProduct);
router.route("/addreview").post(isLoggedIn, addReview);
router.route("/deletereview").delete(isLoggedIn, deleteReview);
router.route("/getreviews").get(getReviewsOneProduct);

// admin routes
router
  .route("/admin/createProduct")
  .post(isLoggedIn, role("admin"), addProduct);

router
  .route("/admin/products")
  .get(isLoggedIn, role("admin"), adminGetAllProducts);

router
  .route("/admin/products/:id")
  .put(isLoggedIn, role("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, role("admin"), adminDeleteOneProduct);

module.exports = router;
