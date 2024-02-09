const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide a name of product."],
    trim: true,
    maxlength: [120, "must not exceed 120 characters of product name."],
  },

  price: {
    type: Number,
    required: [true, "please provide a price of product."],
  },

  description: {
    type: String,
    required: [true, "please provide a description of product."],
  },

  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],

  category: {
    type: String,
    required: [true, "please provide a category of product."],
    enum: {
      values: ["shortSleeves", "longSleeves", "sweatShirt", "hoodies"],
      message:
        "please select category from shortSleeves, longSleeves, sweatShirt and hoodies.",
    },
  },

  stock: {
    type: Number,
    required: [true, "please provide a stock of product."],
  },

  brand: {
    type: String,
    required: [true, "provide brand of product."],
  },

  ratings: {
    type: Number,
    default: 0,
  },

  numberOfReviews: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },

      name: {
        type: String,
        require: true,
      },

      rating: {
        type: Number,
        required: true,
      },

      comment: {
        type: String,
        required: true,
      },
    },
  ],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
