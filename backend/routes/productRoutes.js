const express = require("express");
const {
  addProduct,
  getAllProducts,
} = require("../controllers/productController");
const { isLoggedIn, role } = require("../middlewares/userMiddleware");
const router = express.Router();

// user routes
router.route("/products").get(getAllProducts);

// admin routes
router
  .route("/admin/createProduct")
  .post(isLoggedIn, role("admin"), addProduct);

module.exports = router;
