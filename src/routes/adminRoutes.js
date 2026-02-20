const express = require("express");
const router = express.Router();

const requireAdmin = require("../middlewares/requireAdmin");
const { getLogin, postLogin, listAudit } = require("../controllers/adminController");

router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/", requireAdmin, listAudit);

module.exports = router;
