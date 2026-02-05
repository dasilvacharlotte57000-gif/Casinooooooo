const express = require("express");
const multer = require("multer");
const router = express.Router();

const protectRoutes = require("../middlewares/protectRoutes");

const upload = multer({ storage: multer.memoryStorage() });
const { list, create, remove } = require("../controllers/partenariatEmployerController");

// ✅ PUBLIC : lecture / recherche
router.get("/", list);

// 🔒 PROTÉGÉ : création (upload photo)
router.post("/", protectRoutes, upload.single("photo"), create);

// 🔒 PROTÉGÉ : suppression
router.post("/:id/delete", protectRoutes, remove);

module.exports = router;
