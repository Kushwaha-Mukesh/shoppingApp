const app = require("./app");
const connectDB = require("./config/database");
require("dotenv").config();

// connect to database
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
