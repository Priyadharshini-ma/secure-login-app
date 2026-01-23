const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// SIGNUP route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

// Hash password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Create new user
const newUser = new User({
  name,
  email,
  password: hashedPassword
});

await newUser.save();

// 3️⃣ Success response
return res.status(201).json({
  message: "User registered successfully"
});

} catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// LOGIN route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

  return res.status(200).json({
    message: "Login successful",
    token: token
  });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔒 Protected route
router.get("/profile", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "You are authorized ",
    user: req.user
  });
});


module.exports = router;
