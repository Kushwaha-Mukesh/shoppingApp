const express = require("express");
const router = express.Router();
const {home, login} = require("../controllers/home");

router.route("/").get(home);

router.route("/login").get(login);

module.exports = router;