const express = require("express");
const router = express.Router();

const { showMenu } = require("../controllers/menuController");

router.get("/", showMenu);

module.exports = router;
