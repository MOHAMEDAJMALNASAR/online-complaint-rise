const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("Not authorized, no token provided", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.role || decoded.role !== "admin") {
      return next(new AppError("Not authorized, invalid token", 401));
    }
    req.admin = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return next(new AppError("Not authorized, token invalid or expired", 401));
  }
};