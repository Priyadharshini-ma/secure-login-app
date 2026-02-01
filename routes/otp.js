const express = require("express");
const router = express.Router();

let otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  console.log("✅ OTP request received for:", email);
  console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);

  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = generateOTP();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Secure Login App", email: "priyanu2419@gmail.com" },
        replyTo: { name: "Support", email: "priyanu2419@gmail.com"},
        subject: "Your OTP Code",
        textContent: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API Error:", result);
      return res.status(500).json({ message: "OTP send failed", error: result });
    }

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ OTP API ERROR:", err);
    return res.status(500).json({ message: "OTP send failed", error: err.message });
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

  return res.status(400).json({ message: "Invalid OTP" });
});

module.exports = router;
