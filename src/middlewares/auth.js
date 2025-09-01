const jwt = require("jsonwebtoken");
require('dotenv').config();


function authorizeRole(role) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(403).json({ error: "No autorizado" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Token inválido" });

      req.user = decoded;
      if (role && ((role === "teacher" && decoded.role !== 1) || (role === "student" && decoded.role !== 0))) {
        return res.status(403).json({ error: "Rol no permitido" });
      }
      next();
    });
  };
}

module.exports = { authorizeRole };
