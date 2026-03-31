const express = require("express");
const multer = require("multer");
const router = express.Router();

const protectRoutes = require("../middlewares/protectRoutes");
const { list, create, update, remove, listHistory, checkHistory } = require("../controllers/blacklistController");

const upload = multer({ storage: multer.memoryStorage() });

// ✅ PUBLIC : vérification d'historique (API JSON)
router.get("/check-history", checkHistory);

// ✅ PUBLIC : historique des anciens blacklistés
router.get("/history", listHistory);

// ✅ PUBLIC : lecture / recherche
router.get("/", list);

// 🔒 PROTÉGÉ : ajout
router.post("/", protectRoutes, upload.single("photo"), create);

// 🔒 PROTEGE : modification
router.post("/:id/update", protectRoutes, upload.single("photo"), update);

// 🔒 PROTÉGÉ : suppression
router.post("/:id/delete", protectRoutes, remove);

module.exports = router;
