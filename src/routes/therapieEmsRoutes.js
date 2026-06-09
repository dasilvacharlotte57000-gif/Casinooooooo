const express = require("express");
const multer = require("multer");
const router = express.Router();

const protectRoutes = require("../middlewares/protectRoutes");
const {
  list,
  create,
  update,
  toggleCompleted,
  remove
} = require("../controllers/therapieEmsController");

const upload = multer({ storage: multer.memoryStorage() });

// ✅ PUBLIC : lecture
router.get("/", list);

// 🔒 PROTÉGÉ : ajout
router.post("/", protectRoutes, upload.single("photo"), create);

// 🔒 PROTÉGÉ : modification
router.post("/:id/update", protectRoutes, upload.single("photo"), update);

// 🔒 PROTÉGÉ : cocher thérapie effectuée
router.post("/:id/toggle-completed", protectRoutes, toggleCompleted);

// 🔒 PROTÉGÉ : suppression
router.post("/:id/delete", protectRoutes, remove);

module.exports = router;
