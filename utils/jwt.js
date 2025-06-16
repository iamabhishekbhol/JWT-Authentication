const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;

//function to generate access token -> // Used to access protected routes like /dashboard, /profile

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

//function to generate long lived refresh token

function refreshToken(user) {
  return jwt.sign(
  {
    id: user.id,
    username: user.username,
  },
  JWT_REFRESH_TOKEN,
  {
    expiresIn: '7d',
  }
  )
}

// verifies access token
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// verifies refresh token
function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_TOKEN);
}

module.exports = {
  generateToken,
  verifyToken,
  refreshToken,
  verifyRefreshToken,
  JWT_SECRET,
  JWT_REFRESH_TOKEN
};
