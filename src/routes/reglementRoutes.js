const express = require("express");
const router = express.Router();

const { showReglement } = require("../controllers/reglementController");

router.get("/", showReglement);

module.exports = router;
