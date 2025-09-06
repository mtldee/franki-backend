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

// POST /activities
app.post("/activities", authorizeRole("teacher"), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { title, description, status, courseId } = req.body;

    const course = await sequelize.models.Course.findOne({
      where: { id: courseId, teacherId }
    });

    if (!course) {
      return res.status(403).json({ error: "No puedes agregar actividades a este curso" });
    }

    const activity = await sequelize.models.Activity.create({
      title,
      description,
      status,
      courseId,
      userId: teacherId
    });

    res.status(201).json({ message: "Actividad creada", activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la actividad" });
  }
});

// GET /teacher/courses
app.get("/teacher/courses", authorizeRole("teacher"), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const courses = await sequelize.models.Course.findAll({
      where: { teacherId }
    });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al traer cursos" });
  }
});

app.get("/activities", async (req, res) => {
  console.log("GET /activities");
  try {
    const activities = await sequelize.models.Activity.findAll({
      include: [
        {
          model: sequelize.models.Course,
          as: "course",
          attributes: ["name"]
        },
        {
          model: sequelize.models.User,
          as: "teacher",
          attributes: ["username"]
        }
      ]
    });

    const formatted = activities.map(act => ({
      id: act.id,
      title: act.title,
      description: act.course?.name || "Sin curso",
      status: act.status,
      icon: act.icon || "⭕️" 
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al traer actividades" });
  }
});

// GET /activities/:id
app.get("/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID recibido:", id);

    const activity = await sequelize.models.Activity.findByPk(id, {
      include: [
        {
          model: sequelize.models.Course,
          as: "course",
          attributes: ["id", "name", "grade", "letter"]
        },
        {
          model: sequelize.models.User,
          as: "teacher", 
          attributes: ["id", "username"]
        },
      ],
    });

    if (!activity) {
      return res.status(404).json({ error: "Actividad no encontrada" });
    }

    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener la actividad" });
  }
});



app.listen(3000, async () => {
  console.log("Servidor corriendo en http://localhost:3000");
  await sequelize.authenticate();
  console.log("Conectado a la base de datos ✅");
});
