const express = require("express");
const multer = require("multer");
const router = express.Router();

const protectRoutes = require("../middlewares/protectRoutes");
const { list, create, remove } = require("../controllers/blacklistController");

const upload = multer({ storage: multer.memoryStorage() });

// ✅ PUBLIC : lecture / recherche
router.get("/", list);

// 🔒 PROTÉGÉ : ajout
router.post("/", protectRoutes, upload.single("photo"), create);

// 🔒 PROTÉGÉ : suppression
router.post("/:id/delete", protectRoutes, remove);

module.exports = router;
