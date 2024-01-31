require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();

// morgan middlware
app.use(morgan("tiny"));

// for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
try {
  const swaggerDocument = YAML.load("./swagger.yaml");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.log(error.message);
}

// importing routes
const route = require("./routes/routes");

// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookies and file upload
app.use(cookieParser());
app.use(fileUpload());

// router middleware
app.use("/api/v1", route);

module.exports = app;