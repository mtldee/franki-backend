const jwt = require("jsonwebtoken");
require("dotenv").config();

function authorizeRole(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(403).json({ error: "No autorizado" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) {
    return res.status(403).json({ error: "Token inválido" });
  }

  req.user = decoded;

  if (!Array.isArray(roles)) roles = [roles];

  if (!roles.includes(decoded.role)) {
    return res.status(403).json({ error: "Rol no permitido" });
  }
  next();
});
  };
}
module.exports = { authorizeRole };
