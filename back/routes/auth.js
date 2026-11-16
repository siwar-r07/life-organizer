const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

console.log("Auth routes loaded");

/* TOKEN HELPERS */

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

/* EMAIL TRANSPORTER */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});


/* REGISTER */


router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const usernameClean = username?.trim();
    const emailClean = email?.trim().toLowerCase();

    if (!usernameClean || !emailClean || !password) {
      return res.status(400).json("Please fill all fields");
    }

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(emailClean)) {
      return res.status(400).json("Invalid email format");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json(
        "Password must be at least 8 characters and include uppercase, lowercase and a number"
      );
    }

    const existingUser = await User.findOne({ email: emailClean });

    if (existingUser) {
      return res.status(400).json("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: usernameClean,
      email: emailClean,
      password: hashedPassword
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully"
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Registration failed"
    });
  }
});


/* LOGIN */


router.post("/login", async (req, res) => {
  try {
    const emailClean = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!emailClean || !password) {
      return res.status(400).json("Email and password required");
    }

    const user = await User.findOne({ email: emailClean });

    if (!user) {
      return res.status(401).json("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json("Invalid email or password");
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return res.status(500).json("JWT secrets missing in .env");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json("Login failed");
  }
});


/* LOGOUT */

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await User.updateOne(
        { refreshToken },
        { $unset: { refreshToken: 1 } }
      );
    }

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      message: "Logout failed",
    });
  }
});

/* REQUEST PASSWORD CHANGE */

router.put("/request-password-change", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        "Current password and new password are required"
      );
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json(
        "Password must be at least 8 characters and include uppercase, lowercase and a number"
      );
    }

    const user = await User.findById(req.user.id);

 if (!user) {
  return res.status(404).json("User not found");
}

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json("Current password is incorrect");
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return res.status(400).json(
        "New password must be different from your current password"
      );
    }

    const passwordChangeToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.passwordChangeToken = passwordChangeToken;
    user.passwordChangeExpire = Date.now() + 15 * 60 * 1000;

    user.pendingPassword = await bcrypt.hash(newPassword, 10);
await user.save();

   const confirmLink =
  `http://localhost:5173/confirm-password-change/${passwordChangeToken}`;

    await transporter.sendMail({
      from: `"Life Organizer" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Life Organizer - Confirm Password Change",
     html: `
  <div style="
    margin: 0;
    padding: 40px 20px;
    background: #f8f5ff;
    font-family: Arial, Helvetica, sans-serif;
  ">

    <div style="
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      padding: 40px 32px;
      box-shadow: 0 8px 30px rgba(124, 58, 237, 0.08);
      text-align: center;
    ">

      <div style="
        width: 60px;
        height: 60px;
        margin: 0 auto 20px;
        border-radius: 16px;
        background: #8b5cf6;
        color: #ffffff;
        font-size: 28px;
        line-height: 60px;
      ">
        🔐
      </div>

      <h1 style="
        margin: 0;
        color: #1f2937;
        font-size: 26px;
      ">
        Confirm your password change
      </h1>

      <p style="
        margin: 18px 0 0;
        color: #6b7280;
        font-size: 15px;
        line-height: 1.7;
      ">
        We received a request to change your
        Life Organizer password.
      </p>

      <p style="
        margin: 8px 0 0;
        color: #6b7280;
        font-size: 15px;
        line-height: 1.7;
      ">
        If you made this request, click the button below
        to confirm the change.
      </p>

      <a
        href="${confirmLink}"
        style="
          display: inline-block;
          margin-top: 28px;
          padding: 14px 28px;
          background: #8b5cf6;
          color: #ffffff;
          text-decoration: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: bold;
        "
      >
        Confirm password change
      </a>

      <p style="
        margin: 24px 0 0;
        color: #9ca3af;
        font-size: 13px;
        line-height: 1.6;
      ">
        This link will expire in 15 minutes.
      </p>

      <div style="
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #f0edf7;
      ">
        <p style="
          margin: 0;
          color: #9ca3af;
          font-size: 12px;
          line-height: 1.6;
        ">
          If you didn't request this password change,
          you can safely ignore this email.
        </p>
      </div>

    </div>

    <p style="
      margin: 20px 0 0;
      text-align: center;
      color: #aaa;
      font-size: 12px;
    ">
      Life Organizer
    </p>

  </div>
`
    });

    res.json(
      "Confirmation email sent. Please check your email."
    );

  } catch (error) {
    console.error(
      "REQUEST PASSWORD CHANGE ERROR:",
      error
    );

    res.status(500).json(
      "Failed to send password confirmation email"
    );
  }
});
/* REQUEST EMAIL CHANGE */

router.put("/request-email-change", verifyToken, async (req, res) => {
  try {
    const { newEmail, currentPassword } = req.body;

    if (!newEmail || !currentPassword) {
      return res.status(400).json({
        message: "New email and current password are required"
      });
    }

    const emailClean = newEmail.trim().toLowerCase();

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(emailClean)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    if (emailClean === user.email) {
      return res.status(400).json({
        message: "This is already your current email"
      });
    }

    const existingUser = await User.findOne({
      email: emailClean
    });

    if (existingUser) {
      return res.status(400).json({
        message: "This email is already registered"
      });
    }

    const emailChangeToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.pendingEmail = emailClean;
    user.emailChangeToken = emailChangeToken;
    user.emailChangeExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const confirmLink =
      `http://localhost:5173/confirm-email-change/${emailChangeToken}`;

    await transporter.sendMail({
      from: `"Life Organizer" <${process.env.EMAIL}>`,
      to: emailClean,
      subject: "Life Organizer - Confirm Email Change",
      html: `
        <h2>Confirm your new email address</h2>

        <p>You requested to change your Life Organizer email address.</p>

        <p>Click below to confirm your new email:</p>

        <a href="${confirmLink}">
          Confirm new email
        </a>

        <p>This link expires in 15 minutes.</p>

        <p>If you didn't request this change, you can ignore this email.</p>
      `
    });

    res.json({
      message: "Verification email sent to your new email address"
    });

  } catch (error) {
    console.error("REQUEST EMAIL CHANGE ERROR:", error);

    res.status(500).json({
      message: "Failed to send email verification"
    });
  }
});
/* CONFIRM PASSWORD CHANGE */

router.post("/confirm-password-change/:token", async (req, res) => {
  try {

const user = await User.findOne({
  passwordChangeToken: req.params.token
});

if (!user) {
  return res.status(400).json(
    "Invalid password confirmation link"
  );
}


if (user.passwordChangeExpire <= Date.now()) {
  return res.status(400).json(
    "Password confirmation link expired"
  );
}

    if (!user.pendingPassword) {
      return res.status(400).json(
        "No password change is pending"
      );
    }

   
user.password = user.pendingPassword;
user.passwordChangeToken = undefined;
user.passwordChangeExpire = undefined;
user.pendingPassword = undefined;
user.refreshToken = undefined;

await user.save();


    res.json("Password changed successfully");

  } catch (error) {
    console.error(
      "CONFIRM PASSWORD CHANGE ERROR:",
      error
    );

    res.status(500).json(
      "Failed to confirm password change"
    );
  }
});

/* CONFIRM EMAIL CHANGE */

router.post("/confirm-email-change/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      emailChangeToken: req.params.token,
      emailChangeExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired email verification link"
      });
    }

    if (!user.pendingEmail) {
      return res.status(400).json({
        message: "No email change is pending"
      });
    }

    const existingUser = await User.findOne({
      email: user.pendingEmail,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "This email is already registered"
      });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeExpire = undefined;

    await user.save();

    res.json({
      message: "Your email address has been changed successfully",
      user: {
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error("CONFIRM EMAIL CHANGE ERROR:", error);

    res.status(500).json({
      message: "Failed to confirm email change"
    });
  }
});
/* REFRESH ACCESS TOKEN */

router.post("/refresh", async (req, res) => {

  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json("Refresh token required");
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(403).json("Invalid refresh token");
    }

    const verified = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    if (verified.id !== user._id.toString()) {
      return res.status(403).json("Invalid refresh token");
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      token: newAccessToken
    });

  } catch (error) {

    console.error("REFRESH ERROR:", error);

    return res.status(403).json("Refresh token expired or invalid");

  }

});
/* FORGOT PASSWORD */

router.post("/forgot-password", async (req, res) => {

  const { email } = req.body;

  try {

    const user = await User.findOne({
  email: email?.trim().toLowerCase(),
});

if (!user) {
  return res.json(
    "If an account exists with this email, a password reset link has been sent."
  );
}

    const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = resetToken;
user.resetPasswordExpire = Date.now() + 3600000;

await user.save();

    const resetLink = `http://localhost:5173/reset/${resetToken}`;

    const info = await transporter.sendMail({
  from: `"Life Organizer" <${process.env.EMAIL}>`,
  to: email,
  subject: "Life Organizer - Password Reset",
  html: `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link expires in 1 hour.</p>
  `
});
console.log("EMAIL PREVIEW:", nodemailer.getTestMessageUrl(info));
    res.json("Password reset email sent");

  } catch (error) {

    console.error(error);
    res.status(500).json("Error sending reset email");

  }

});


/* RESET PASSWORD */

router.post("/reset-password/:token", async (req, res) => {

  const { password } = req.body;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

if (!passwordRegex.test(password)) {
  return res.status(400).json(
    "Password must be at least 8 characters and include uppercase, lowercase and a number"
  );
}
  try {

   const user = await User.findOne({
  resetPasswordToken: req.params.token,
  resetPasswordExpire: { $gt: Date.now() }
});
    if (!user) {
      return res.status(400).json("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   
user.password = hashedPassword;
user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;
user.refreshToken = undefined;

await user.save();


    res.json("Password reset successful");

  } catch (error) {

    console.error(error);
    res.status(500).json("Password reset failed");

  }

});


module.exports = router;