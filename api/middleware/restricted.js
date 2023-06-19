const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json("token required");
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET || 'TestSecretKey');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json("token invalid");
  }
};