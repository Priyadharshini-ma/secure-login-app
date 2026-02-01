const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

let otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  console.log("✅ OTP request received for:", email);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);


  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = generateOTP();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"OTP Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP MAIL ERROR:", err);
    res.status(500).json({ message: "OTP send failed", error: err.message });
  }
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "OTP expired or not found" });

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp === otp) {
    delete otpStore[email];
    return res.json({ message: "OTP verified" });
  }

  res.status(400).json({ message: "Invalid OTP" });
});

module.exports = router;
