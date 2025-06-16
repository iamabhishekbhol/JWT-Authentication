const express = require("express");
const bcrypt = require("bcryptjs");
const {
  generateToken,
  verifyRefreshToken,
  refreshToken,
} = require("../utils/jwt");
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
  const accessToken = generateToken(user);

  //  persist new access token in db
  const newRefreshToken = refreshToken(user);
  
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  res.json({
    message: "Login successful",
    accessToken: accessToken,
    refreshToken: newRefreshToken,
  });
});

// Token rotation
// Client sends a valid refreshToken -> we verify, rotate it, and return a fresh accessToken and refreshToken

router.post("/token", async (req, res) => {
  const { token: incomingRequestToken } = req.body;

  // 1) Ensure token was sent

  if (!incomingRequestToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  let payload;

  try {
    // 2) verify signature and expiry
    payload = verifyRefreshToken(incomingRequestToken);
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }

  // 3) Load user and confirm if the token is still active

  const user =  await UserModel.findById(payload.id);
  if(!user || !user.refreshTokens.includes(incomingRequestToken)){
    return res.status(403).json({
      error: "refresh token revoked or not found"
    });
  }

  // 4) rotate: remove old, create and persist new

  user.refreshTokens = user.refreshTokens.filter(checktoken => checktoken !== incomingRequestToken); // -> removing the old token from the array

  const newRefreshToken = refreshToken(user);
  user.refreshTokens.push(newRefreshToken)

  await user.save();

  // 5) Issue a new accessToken -> rather than asking user to Login again, we can give this new accessToken to FE so it can use it for the protected routes without logging out

  const newAccessToken = generateToken(user);
  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  })

});


// Logout
// Client calls their refreshToken -> we remove it from the DB (client saves the refresh token usually in localStorage or HTTPOnly cookie)

router.post('/logout', async (req, res) => {
  const { token: refreshTokenRevoke} = req.body;

  if(!refreshTokenRevoke){
    return res.status(400).json({
      error: "Refresh token required"
    });
  }

  // Find the user who owns this token
  const user = await UserModel.findOne({refreshTokens: refreshTokenRevoke});

  // console.log(user.refreshTokens, "found the user")

  if(user){
    //remove it from db

    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshTokenRevoke) // -> doubt: t creates a new array by including only the values that do not match the refreshTokenToRevoke.

    //.filter() builds a new array without the matching token

    await user.save();
  }

  // Don't expose info: always return 204 No Content

  res.sendStatus(204);

  //Whether or not the token exists in the DB, you never expose any internal logic.

  //You don’t tell the client “this token doesn’t exist” — because that could leak information.
})



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
