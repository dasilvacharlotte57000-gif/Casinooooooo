const express = require("express");
const router = express.Router();

const protectRoutes = require("../middlewares/protectRoutes");
const { list, create, remove } = require("../controllers/employeurController");

// ✅ PUBLIC : lecture / recherche
router.get("/", list);

// 🔒 PROTEGE : creation
router.post("/", protectRoutes, create);

// 🔒 PROTEGE : suppression
router.post("/:id/delete", protectRoutes, remove);

module.exports = router;
