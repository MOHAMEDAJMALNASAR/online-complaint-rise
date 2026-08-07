const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
  bulkUpdateStatus,
  bulkDelete,
} = require("../controllers/complaintController");

router.use(auth);

router.get("/", getAllComplaints);
router.get("/stats", getComplaintStats);
router.post("/bulk-status", bulkUpdateStatus);
router.post("/bulk-delete", bulkDelete);
router.get("/:id", getComplaintById);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);

module.exports = router;