const express = require("express");
const router = express.Router();

const { list, create, remove } = require("../controllers/avertissementController");

// 🔒 Protege : lecture/creation/suppression
router.get("/", list);
router.post("/", create);
router.post("/:id/delete", remove);

module.exports = router;
