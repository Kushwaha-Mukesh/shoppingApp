const cookieToken = require("../utils/cookieToken");
const User = require("../models/user");
const mailGenerator = require("../utils/emailGenerator");
const cloudinary = require("cloudinary").v2;

exports.signup = async (req, res, next) => {
  try {
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
  } catch (error) {
    res.status(500).send("Error in signing up the user: " + error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(301).send("Email and Password are required to login");
      return;
    }

    // here select method selects password field from DB, as in user model select property is set to false.
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(404).send("User does not exist");
      return;
    }

    const isValidatePassword = await user.isValidatePassword(password);

    if (!isValidatePassword) {
      res.status(401).send("Email or password do not match");
      return;
    }

    cookieToken(user, res);
  } catch (error) {
    res.status(500).send("Error in logging user: " + error.message);
  }
};

// while logging out we have to delete token where ever it is store.
// BECAUSE THE EXPIRE TIME OF TOKEN CANNOT BE CHANGE AFTER SENDING TO USER AS TOKEN IS STATELESS.
exports.logout = (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).send("User logged out successfully");
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).send("user does not exist");
      return;
    }

    const forgotToken = user.getForgotPasswordToken();

    // flage used in save method is save the forgot token and expire of token without validating all the field.
    await user.save({ validateBeforeSave: false });

    // this url is created to send mail to the user who forgot password
    // here req.protocol is https or http and req.get("host") is localhost or any other host and remaining is route and forgot token
    const myUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${forgotToken}`;

    const message = `copy and paste this link in your browser \n\n ${myUrl}`;

    try {
      await mailGenerator({
        toEmail: user.email,
        subject: "password reset mail",
        text: message,
      });

      res.status(200).send("check your email to reset your password");
    } catch (error) {
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpiry = undefined;
      user.save({ validateBeforeSave: false });

      res.status(502).send("error in resseting password: " + error.message);
      return;
    }
  } catch (error) {
    res.status(501).send("Error in forgot password route: " + error.message);
  }
};
