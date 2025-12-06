const express = require("express");
const router = express.Router();

const {
  list,
  create,
  update,
  remove,
  generateCode,
  listPublic,
} = require("../controllers/inventory.controller");

const {
  requireUser,
  requireAdmin,
} = require("../middleware/authUser.middleware");

// ADMIN ROUTES
router.get("/", requireUser, requireAdmin, list);
router.post("/", requireUser, requireAdmin, create);
router.put("/:id", requireUser, requireAdmin, update);
router.delete("/:id", requireUser, requireAdmin, remove);

router.post("/:id/generate-code", requireUser, requireAdmin, generateCode);

// STUDENT ROUTES
router.get("/public", requireUser, listPublic);

module.exports = router;
