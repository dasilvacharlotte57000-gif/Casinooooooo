const express = require("express");
const router = express.Router();

const protectRoutes = require("../middlewares/protectRoutes");
const { list, create, remove } = require("../controllers/blacklistController");

// ✅ PUBLIC : lecture / recherche
router.get("/", list);

// 🔒 PROTÉGÉ : ajout
router.post("/", protectRoutes, create);

// 🔒 PROTÉGÉ : suppression
router.post("/:id/delete", protectRoutes, remove);

module.exports = router;
