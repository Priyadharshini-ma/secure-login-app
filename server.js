const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const cors = require("cors");
const otpRoutes = require("./routes/otp");
const path = require("path");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use(express.static("public"));



// ✅ ADD THIS PART (MongoDB connection)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log("Server running on port ${PORT}");
});
  

