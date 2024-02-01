const cookieToken = require("../middlewares/cookieToken");
const User = require("../models/user");
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return new Error("Name, Email and password requird");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  cookieToken(user, res);
};
