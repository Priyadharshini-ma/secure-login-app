const express = require("express");
const router = express.Router();

let otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ SEND OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("✅ OTP request received for:", email);
    console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const otp = generateOTP();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min

    // ✅ Brevo API call
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Secure Login App",
          email: "priyanu2419@gmail.com", // ✅ must be verified sender in Brevo
        },
        to: [
          {
            email: email, // ✅ IMPORTANT: explicitly use email variable
          },
        ],

        replyTo: {             // ✅ paste here
          name: "Support",
          email: "priyanu2419@gmail.com"
  },
        subject: "Your OTP Code",
        textContent: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API Error:", data);
      return res.status(500).json({
        message: "OTP send failed",
        error: data,
      });
    }

    console.log("✅ OTP sent using Brevo:", data);
    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ OTP SERVER ERROR:", err);
    return res.status(500).json({ message: "OTP send failed" });
  }
});

// ✅ VERIFY OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

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

  return res.status(400).json({ message: "Invalid OTP" });
});

module.exports = router;
