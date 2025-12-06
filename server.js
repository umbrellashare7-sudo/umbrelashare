require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./src/routes/auth.routes");
const inventoryRoutes = require("./src/routes/inventory.routes");
const transactionRoutes = require("./src/routes/transactions.routes");
const studentAuthRoutes = require("./src/routes/studentAuth.routes");


const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(cors());
app.use(express.json());

/* === API ROUTES === */
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/transactions", transactionRoutes);

console.log("Loaded Mongo URI:", process.env.MONGO_URI);
app.use("/api/student/auth", studentAuthRoutes);



/* === STATIC FRONTEND === */
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

async function start() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  app.listen(PORT, () =>
    console.log(`Server running → http://localhost:${PORT}`)
  );
}

start();
