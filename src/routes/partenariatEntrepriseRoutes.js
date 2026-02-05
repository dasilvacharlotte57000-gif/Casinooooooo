const express = require("express");
const router = express.Router();

const protectRoutes = require("../middlewares/protectRoutes");
const { list, create, remove } = require("../controllers/partenariatEntrepriseController");

// ✅ PUBLIC : lecture / recherche
router.get("/", list);

// 🔒 PROTÉGÉ : création
router.post("/", protectRoutes, create);

// 🔒 PROTÉGÉ : suppression
router.post("/:id/delete", protectRoutes, remove);

module.exports = router;
