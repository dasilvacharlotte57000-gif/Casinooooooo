const express = require("express");
const multer = require("multer");
const router = express.Router();

const protectRoutes = require("../middlewares/protectRoutes");
const { list, create, update, remove } = require("../controllers/blacklistController");

const upload = multer({ storage: multer.memoryStorage() });

// ✅ PUBLIC : lecture / recherche
router.get("/", list);

// 🔒 PROTÉGÉ : ajout
router.post("/", protectRoutes, upload.single("photo"), create);

// 🔒 PROTEGE : modification
router.post("/:id/update", protectRoutes, upload.single("photo"), update);

// 🔒 PROTÉGÉ : suppression
router.post("/:id/delete", protectRoutes, remove);

module.exports = router;
