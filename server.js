require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* -------------------------------------------------
   CORS (must be first)
------------------------------------------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

/* -------------------------------------------------
   SECURITY + PARSER
------------------------------------------------- */
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());

/* -------------------------------------------------
   API ROUTES (must come BEFORE frontend serving)
------------------------------------------------- */
const authRoutes = require("./src/routes/auth.routes");
const inventoryRoutes = require("./src/routes/inventory.routes");
const transactionRoutes = require("./src/routes/transactions.routes");
const studentAuthRoutes = require("./src/routes/studentAuth.routes");

app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/student/auth", studentAuthRoutes);

/* -------------------------------------------------
   STATIC FRONTEND (should NOT intercept /api)
------------------------------------------------- */
app.use(express.static(path.join(__dirname, "frontend/dist")));

/* -------------------------------------------------
   FRONTEND FALLBACK (GET ONLY!)
------------------------------------------------- */
app.get("*", (req, res) => {
  // Never match API
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found" });
  }

  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

/* -------------------------------------------------
   SERVER + DB
------------------------------------------------- */
const PORT = process.env.PORT || 3000;

async function start() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  app.listen(PORT, () =>
    console.log(`Server running → http://localhost:${PORT}`)
  );
}

start();
