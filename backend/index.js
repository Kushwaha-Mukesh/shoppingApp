const app = require("./app");
const connectDB = require("./config/database");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// connect to database
connectDB();
cloudinary.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
