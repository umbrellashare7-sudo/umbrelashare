const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/student.model");

exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).send("Email already registered.");

    const hashed = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      password: hashed,
      balance: 0,
    });

    res.json({
      id: student._id,
      name: student.name,
      email: student.email,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(400).send("Invalid login credentials.");

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).send("Invalid email or password.");

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        balance: student.balance,
        borrowedUmbrellaId: student.borrowedUmbrellaId,
      },
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
