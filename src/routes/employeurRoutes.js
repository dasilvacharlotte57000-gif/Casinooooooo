const express = require("express");
const router = express.Router();

const protectRoutes = require("../middlewares/protectRoutes");
const { list, create, getOne, update, remove } = require("../controllers/employeurController");

// ✅ PUBLIC : lecture / recherche
router.get("/", list);

// ✅ PUBLIC : obtenir un employeur (pour affichage détails)
router.get("/:id", getOne);

// 🔒 PROTEGE : creation
router.post("/", protectRoutes, create);

// 🔒 PROTEGE : mise à jour
router.post("/:id/update", protectRoutes, update);

// 🔒 PROTEGE : suppression
router.post("/:id/delete", protectRoutes, remove);

module.exports = router;
