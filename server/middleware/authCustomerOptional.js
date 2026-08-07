const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.role === "customer") {
        req.customer = { id: decoded.id, email: decoded.email };
      }
    } catch (error) {
      // ignore invalid token; treat request as anonymous
    }
  }
  next();
};
