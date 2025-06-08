const express = require("express");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const authenticateToken = require("../middleware/authMiddleware");
// const user = require("../config/user");
const UserModel = require("../models/UserModel");
const {
  loginValidation,
  registerValidation,
} = require("../middleware/validators/authValidator");
const { validateRequest } = require("../middleware/validators/validateResult");
const router = express.Router();

// @route POST/register
// @desc Register a new user

router.post(
  "/register",
  registerValidation,
  validateRequest,
  async (req, res) => {
    const { username, password } = req.body;

    //basic validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    try {
      //check if user already exists
      const existingUser = await UserModel.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ error: "Username already taken" });
      }

      //hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      //Create and save the new user

      const newUser = new UserModel({
        username: username,
        password: hashedPassword,
      });

      await newUser.save(); // -> Save user to MongoDB

      //Success response
      res.status(201).json({
        message: "User registered successfully",
        userId: newUser._id,
      });
    } catch (error) {
      console.error("Registration error: ", error.message);
      res.status(500).json({
        error: "Server error during registration",
      });
    }
  }
);

// @route   POST /login
// @desc    Login and get JWT token
router.post("/login", loginValidation, validateRequest, async (req, res) => {
  const { username, password } = req.body;

  //basic validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  //find user by username
  const user = await UserModel.findOne({ username });

  if (!user) {
    return res.send(401).json({
      message: "Invalid Username!",
    });
  }

  // Step 1: Check username
  if (username !== user.username) {
    return res.status(401).json({ error: "Invalid Username" });
  }

  // Step 2: Compare hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid Password" });
  }

  // Step 3: Generate and send token
  const token = generateToken(user);
  res.json({
    message: "Login successful",
    token,
  });
});

// @route   GET /protected
// @desc    Access protected route with token
router.get("/protected", authenticateToken, (req, res) => {
  res.json({
    message: "Access granted to the protected route",
    user: req.user,
  });
});

// @route   POST /test-hash
// @desc    Test password verification
router.post("/test-hash", async (req, res) => {
  const { password: userPassword } = req.body;

  if (!userPassword) {
    return res.status(400).json({ message: "Please provide a password!" });
  }

  const isValid = await bcrypt.compare(userPassword, user.password);
  if (!isValid) {
    return res
      .status(403)
      .json({ message: "Invalid Password, Please re-enter!" });
  }

  return res.json({ message: "Password Matched!" });
});

module.exports = router;
