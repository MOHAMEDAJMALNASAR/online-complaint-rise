const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authCustomerOptional = require("../middleware/authCustomerOptional");
const {
  submitComplaint,
  getComplaintById,
} = require("../controllers/complaintController");

router.post(
  "/",
  authCustomerOptional,
  upload.array("images", 5),
  submitComplaint
);

router.get("/:id", getComplaintById);

module.exports = router;