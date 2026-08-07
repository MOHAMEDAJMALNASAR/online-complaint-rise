const express = require("express");
const router = express.Router();
const { login, getMe } = require("../controllers/adminController");
const auth = require("../middleware/auth");

router.post("/login", login);
router.get("/me", auth, getMe);

module.exports = router;