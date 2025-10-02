require("dotenv").config();
const express = require("express");
const { sequelize, User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authorizeRole } = require("./middlewares/auth");
const { authenticateToken } = require("./middlewares/token");


const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors({ origin: ["https://franki-vxof.onrender.com", "http://localhost:5173"] }));

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el login" });
  }
});

// DELETE - DELETE /activities/:id
app.delete("/activities/:id", authorizeRole(1), async (req, res) => {
  try {
    const teacherId = req.user.id;

    const activity = await sequelize.models.Activity.findOne({
      where: { id: req.params.id },
      include: { model: sequelize.models.Course, as: "course" }
    });

    if (!activity) {
      return res.status(404).json({ error: "Actividad no encontrada" });
    }

    if (activity.course.teacherId !== teacherId) {
      return res.status(403).json({ error: "No puedes eliminar esta actividad" });
    }

    await activity.destroy();
    res.json({ message: "Actividad eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la actividad" });
  }
});

// PATCH /users/change-password
app.patch("/users/change-password", authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Debes enviar ambas contraseñas" });
    }

    const user = await sequelize.models.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña actual incorrecta" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cambiar la contraseña" });
  }
});


// POST /activities
app.post("/activities", authorizeRole(1), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { title, description, status, courseId, startDate, endDate } = req.body;

    const course = await sequelize.models.Course.findOne({
      where: { id: courseId, teacherId }
    });

    if (!course) {
      return res.status(403).json({ error: "No puedes agregar actividades a este curso" });
    }

    if (!title || !description || status === undefined || !courseId || !startDate || !endDate) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const activity = await sequelize.models.Activity.create({
      title: title,
      description: description,
      status: status,
      courseId: courseId,
      userId: teacherId,
      startDate: startDate,
      endDate: endDate,
    });

    res.status(201).json({ message: "Actividad creada", activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la actividad" });
  }
});

// GET /activities
app.get("/activities", authorizeRole([0, 1, 2]), async (req, res) => {
  try {
    const { courseId } = req.query;
    const user = req.user;

    let where = {};
    if (courseId) where.courseId = courseId;

    if (user.role === 1) {
      const teacherCourses = await sequelize.models.Course.findAll({ 
        where: { teacherId: user.id }, 
        attributes: ['id'] 
      });
      const ids = teacherCourses.map(c => c.id);
      where.courseId = courseId || ids;
    } else if (user.role === 0) {
      const student = await sequelize.models.User.findByPk(user.id, {
        include: { model: sequelize.models.Course, as: "courses", attributes: ['id'] }
      });
      const ids = student.courses.map(c => c.id);
      where.courseId = courseId || ids;
      where.status = true; 
    }

    const activities = await sequelize.models.Activity.findAll({ where });
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al traer actividades" });
  }
});


// GET /activities/:id
app.get("/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;

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

// PATCH /activities/:id
app.patch("/activities/:id", authorizeRole(1), async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { status } = req.body;

    const activity = await sequelize.models.Activity.findByPk(id);
    if (!activity) {
      return res.status(404).json({ error: "Actividad no encontrada" });
    }

    const course = await sequelize.models.Course.findOne({
      where: { id: activity.courseId, teacherId }
    });

    if (!course) {
      return res.status(403).json({ error: "No puedes modificar esta actividad" });
    }
    if (status !== undefined) activity.status = status;
    await activity.save();

    res.json({ message: "Actividad actualizada", activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la actividad" });
  }
});


// GET /teacher/courses
app.get("/teacher/courses", authorizeRole(1), async (req, res) => {
  try {
    const teacherId = Number(req.user.id);
    const courses = await sequelize.models.Course.findAll({
      where: { teacherId }
    });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al traer cursos" });
  }
});



// GET /users/:courseId/students
app.get("/users/:courseId/students", authorizeRole(1), async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    const course = await sequelize.models.Course.findOne({
      where: { id: courseId, teacherId }
    });

    if (!course) {
      return res.status(403).json({ error: "No puedes ver los estudiantes de este curso" });
    }

    const students = await sequelize.models.User.findAll({
      include: [{
        model: sequelize.models.Course,
        as: 'courses',
        where: { id: courseId },
        attributes: []
      }],
      where: { role: 0 }, 
      attributes: ['id', 'username', 'school', 'grade', 'year']
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al traer estudiantes" });
  }
});

app.post("/teachers", authorizeRole(2), async (req, res) => {
  try {
    const { username, password, schoolId } = req.body;

    if (!username || !password || !schoolId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await User.create({
      username,
      password: hashedPassword,
      schoolId: schoolId,
      role: 1, // rol profesor
    });

    res.status(201).json({ message: "Profesor creado con éxito", teacher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear profesor" });
  }
});

app.get("/schools", authorizeRole(2), async (req, res) => {
  try {
    const schools = await sequelize.models.School.findAll({
      attributes: ['id', 'name']
    });
    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al traer escuelas" });
  }
});

app.listen(3000, async () => {
  console.log("Servidor corriendo en http://localhost:3000");
  await sequelize.authenticate();
  console.log("Conectado a la base de datos ✅");
});
