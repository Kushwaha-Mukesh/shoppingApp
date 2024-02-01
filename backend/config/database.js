const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(console.log("Database connection established"))
    .catch((error) => {
      console.log("Error connecting database: " + error.message);
      process.exit(1);
    });
};

module.exports = connectDB;
