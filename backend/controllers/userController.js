const cookieToken = require("../middlewares/cookieToken");
const User = require("../models/user");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new Error("Name, Email and password requird"));
  }

  if (!req.files) {
    return next(new Error("Photo is required"));
  }

  let file = req.files.photo;
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
};
