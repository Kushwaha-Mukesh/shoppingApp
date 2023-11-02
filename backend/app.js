const express = require("express");
require("dotenv").config();

// importing routes
const home = require("./routes/home");

const app = express();

// router middleware
app.use("/api/v1", home);

module.exports = app;