const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is compulsory"],
    maxlength: [40, "Name should not exceed 40 characters"],
  },
  email: {
    type: String,
    required: [true, "email is compulsory"],
    validate: [validator.isEmail, "email is compulsory"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is compulsory"],
    minlength: [8, "Password should be at least 8 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// encrypt password before saving save - Hook
userSchema.pre("save", async function (next) {
  // if we do not use isModified, then when userSchema is called the password keep on hashing although it is not modified.
  if (!this.isModified("password")) return next(); // here isModified is used to prevent overwriting of hash password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// validate the password with passed on user password
userSchema.methods.isValidatePassword = async function (usersendPassword) {
  return await bcrypt.compare(usersendPassword, this.password); // this return either true or false
};

// create and return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function () {
  // generate a long and random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  // getting a hash - make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  // time of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
