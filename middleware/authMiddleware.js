const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/jwt");

/**
 * Middleware to authenticate and verify JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Expected: "Bearer <token>"
  const token = authHeader?.split(" ")[1]; // Extract the token

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verify token
  jwt.verify(token, JWT_SECRET, (err, userData) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = userData; // Attach decoded data to request
    next(); // Proceed to next middleware/route
  });
}

module.exports = authenticateToken;
