const User = require("../models/user");
const Jwt = require("jsonwebtoken");

exports.isLoggedIn = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      res.status(301).send("Login to proceed...");
      return;
    }

    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(501).send("Error in user middleware file: " + error.message);
  }
};
