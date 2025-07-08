const jwt = require("jsonwebtoken");

// General authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info from token into request
    console.log(
      `User is authenticated: ${decoded.userId}, Role: ${decoded.role}`
    );
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Role-specific middleware
const isApiUser = (req, res, next) => {
  console.log("Checking role:", req.user.role); // 👀 LOG THIS

  if (req.user && req.user.role === "user") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied: User role required" });
  }
};

const isApiAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied: Admin role required" });
  }
};

module.exports = { authenticateJWT, isApiUser, isApiAdmin };
