const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const otpRoutes = require("./routes/otp");
const cors = require("cors");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

app.use(cors({
  origin: "https://grand-kulfi-8d88af.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
