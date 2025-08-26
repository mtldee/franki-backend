require("dotenv").config();
const express = require("express");
const { sequelize, User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authorizeRole } = require("./middlewares/auth");


const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ message: "Login exitoso", token, role: user.role });
});

app.get("/student/dashboard", authorizeRole("student"), (req, res) => {
  res.send("Bienvenido alumno");
});

app.get("/teacher/dashboard", authorizeRole("teacher"), (req, res) => {
  res.send("Bienvenido profesor");
});


app.listen(3000, async () => {
  console.log("Servidor corriendo en http://localhost:3000");
  await sequelize.authenticate();
  console.log("Conectado a la base de datos ✅");
});
