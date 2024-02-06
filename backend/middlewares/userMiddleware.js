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

exports.role = (...role) => {
  try {
    return (req, res, next) => {
      if (!role.includes(req.user.role)) {
        res.status(301).send("Access denied!!!");
        return;
      }
      next();
    };
  } catch (error) {
    res.status(500).send("Error in getting role: " + error.message);
  }
};
