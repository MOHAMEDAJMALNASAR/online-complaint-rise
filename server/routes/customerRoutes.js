const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  getMyComplaints,
} = require("../controllers/customerController");
const authCustomer = require("../middleware/authCustomer");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authCustomer, getMe);
router.get("/complaints", authCustomer, getMyComplaints);

module.exports = router;
