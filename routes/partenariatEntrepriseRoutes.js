const express = require("express");
const router = express.Router();
const { list, create, remove } = require("../controllers/partenariatEntrepriseController");

router.get("/", list);
router.post("/", create);
router.post("/:id/delete", remove);

module.exports = router;
