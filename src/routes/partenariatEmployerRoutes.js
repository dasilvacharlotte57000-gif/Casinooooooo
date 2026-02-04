const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const { list, create, remove } = require("../controllers/partenariatEmployerController");

router.get("/", list);
router.post("/", upload.single("photo"), create);
router.post("/:id/delete", remove);

module.exports = router;
