const express = require("express");
const router = express.Router();

const authCtrl = require("../controllers/auth.controller");
const { requireUser } = require("../middleware/authUser.middleware");

// ADMIN REGISTER
router.post("/register", authCtrl.register);

// ADMIN LOGIN
router.post("/login", authCtrl.login);

// GET CURRENT USER (ADMIN OR STUDENT)
router.get("/me", requireUser, authCtrl.me);

module.exports = router;
