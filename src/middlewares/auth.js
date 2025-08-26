const jwt = require("jsonwebtoken");
require('dotenv').config();


function authorizeRole(role) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.sendStatus(403);

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      if (decoded.role !== role) return res.sendStatus(403);
      req.user = decoded;
      next();
    });
  };
}

module.exports = { authorizeRole };
