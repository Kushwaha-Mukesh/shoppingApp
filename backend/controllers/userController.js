const cookieToken = require("../utils/cookieToken");
const User = require("../models/user");
const mailGenerator = require("../utils/emailGenerator");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

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
  res.status(200).send("Logged out successfully");
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

    // flag used in save method is save the forgot token and expire of token without validating all the field.
    await user.save({ validateBeforeSave: false });

    // this url is created to send mail to the user who forgot password
    // here req.protocol is https or http and req.get("host") is localhost or any other host and remaining is route and forgot token
    const myUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/user/password/reset/${forgotToken}`;

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

exports.forgotPasswordReset = async (req, res) => {
  try {
    const forgotToken = req.params.forgotToken;
    const encryptForgotToken = crypto
      .createHash("sha256")
      .update(forgotToken)
      .digest("hex");

    const user = await User.findOne({
      forgotPasswordToken: encryptForgotToken,
      forgotPasswordExpiry: { $gt: Date.now() }, // here $gt query looks for the time greater than now. $gt is given by mongoose.
    });

    if (!user) {
      res
        .status(301)
        .send("Invalid token or token expired. Please try again!!!");
      return;
    }

    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      res
        .status(301)
        .send("password and confirm password are not same. Please try again!");
      return;
    }

    // here password is update with new password.
    user.password = password;
    // after upadate of password these field should be undefined.
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    // and save the changes to that specific user db.
    await user.save();

    // here we can send success message instead of token and user.
    cookieToken(user, res);
  } catch (error) {
    res
      .status(501)
      .send("Error on resetting forgot password: " + error.message);
  }
};

exports.getLoggedInUserDetails = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
};

exports.changePassword = async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");
  const IsCorrectOldPassword = await user.isValidatePassword(
    req.body.oldPassword
  );
  if (!IsCorrectOldPassword) {
    res.status(301).send("Enter the correct old password");
    return;
  }

  user.password = req.body.newPassword;
  await user.save();

  cookieToken(user, res);
};

exports.updateUserDetails = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(301).send("Please enter a name or email address to update.");
      return;
    }
    const newUserData = {
      name,
      email,
    }; // data send by user to update their details.

    if (req.files) {
      const user = await User.findById(req.user.id);

      // destroying old photo
      const resp = await cloudinary.uploader.destroy(user.photo.id);

      // uploading new photo
      const result = await cloudinary.uploader.upload(
        req.files.photo.tempFilePath,
        {
          folder: "users",
          width: 150,
          crop: "scale",
        }
      );

      newUserData.photo = {
        id: result.public_id,
        secure_url: result.secure_url,
      };
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      runValidators: true,
      new: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(501).send("Error updating user details: " + error.message);
  }
};
