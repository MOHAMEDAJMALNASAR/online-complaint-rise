const Complaint = require("../models/Complaint");
const generateComplaintId = require("../utils/generateComplaintId");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");

function validatePayload(body) {
  const required = {
    customerName: "Customer name",
    mobile: "Mobile number",
    orderId: "Order ID",
    productName: "Product name",
    category: "Complaint category",
    description: "Complaint description",
  };

  for (const [key, label] of Object.entries(required)) {
    const value = typeof body[key] === "string" ? body[key].trim() : body[key];
    if (value === undefined || value === null || value === "") {
      throw new AppError(`${label} is required`, 400);
    }
  }
}

const allowedCategories = [
  "Damaged Product",
  "Wrong Product",
  "Missing Item",
  "Product Quality Issue",
  "Other",
];

const allowedStatuses = ["pending", "in-progress", "resolved", "rejected"];

exports.submitComplaint = asyncHandler(async (req, res) => {
  validatePayload(req.body);

  const {
    customerName,
    mobile,
    email,
    orderId,
    productName,
    category,
    description,
  } = req.body;

  if (!allowedCategories.includes(category)) {
    throw new AppError("Invalid complaint category", 400);
  }

  const complaintId = await generateComplaintId();

  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => `/uploads/${file.filename}`);
  }

  const complaint = await Complaint.create({
    complaintId,
    customerName: customerName.trim(),
    customer: req.customer ? req.customer.id : null,
    mobile: mobile.trim(),
    email: req.customer ? req.customer.email : email ? email.trim().toLowerCase() : "",
    orderId: orderId.trim(),
    productName: productName.trim(),
    category,
    description: description.trim(),
    images,
    status: "pending",
    statusHistory: [
      {
        status: "pending",
        note: "Complaint registered by customer",
        changedBy: "Customer",
        changedAt: new Date(),
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: "Complaint submitted successfully",
    data: complaint,
  });
});

exports.getAllComplaints = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    category,
    sort = "newest",
    page = 1,
    limit = 50,
  } = req.query;

  const filter = {};

  if (status && status !== "all") {
    filter.status = status;
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (search) {
    const safeSearch = search.trim();
    const re = new RegExp(safeSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ complaintId: re }, { customerName: re }, { orderId: re }];
  }

  const sortOption =
    sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500);

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Complaint.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: complaints,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

exports.getComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let complaint = null;

  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    complaint = await Complaint.findById(id);
  }

  if (!complaint) {
    complaint = await Complaint.findOne({ complaintId: id });
  }

  if (!complaint) {
    throw new AppError("Complaint not found", 404);
  }

  res.json({ success: true, data: complaint });
});

exports.updateComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let complaint = await Complaint.findById(id).catch(() => null);
  if (!complaint) {
    complaint = await Complaint.findOne({ complaintId: id });
  }
  if (!complaint) {
    throw new AppError("Complaint not found", 404);
  }

  const { status, adminNote } = req.body;

  let statusChanged = false;
  if (status !== undefined) {
    if (!allowedStatuses.includes(status)) {
      throw new AppError("Invalid complaint status", 400);
    }
    if (
      status !== complaint.status &&
      (complaint.status === "resolved" || complaint.status === "rejected")
    ) {
      throw new AppError(
        `This complaint is closed (${complaint.status}) and can no longer be updated`,
        400
      );
    }
    if (status !== complaint.status) {
      complaint.status = status;
      complaint.statusHistory.push({
        status,
        note: adminNote && adminNote.trim() ? adminNote.trim() : "",
        changedBy: req.admin ? req.admin.email : "Admin",
        changedAt: new Date(),
      });
      statusChanged = true;
    }
  }

  if (adminNote !== undefined) {
    if (!statusChanged && adminNote.trim() !== complaint.adminNote) {
      complaint.statusHistory.push({
        status: complaint.status,
        note: adminNote.trim(),
        changedBy: req.admin ? req.admin.email : "Admin",
        changedAt: new Date(),
      });
    }
    complaint.adminNote = adminNote.trim();
  }

  await complaint.save();

  res.json({
    success: true,
    message: "Complaint updated successfully",
    data: complaint,
  });
});

exports.deleteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let complaint = await Complaint.findById(id).catch(() => null);
  if (!complaint) {
    complaint = await Complaint.findOne({ complaintId: id });
  }
  if (!complaint) {
    throw new AppError("Complaint not found", 404);
  }

  for (const image of complaint.images) {
    const filename = path.basename(image);
    const filePath = path.join(uploadsDir, filename);
    fs.unlink(filePath, () => {});
  }

  await complaint.deleteOne();

  res.json({ success: true, message: "Complaint deleted successfully" });
});

exports.getComplaintStats = asyncHandler(async (req, res) => {
  const [total, pending, inProgress, resolved, rejected] = await Promise.all([
    Complaint.countDocuments({}),
    Complaint.countDocuments({ status: "pending" }),
    Complaint.countDocuments({ status: "in-progress" }),
    Complaint.countDocuments({ status: "resolved" }),
    Complaint.countDocuments({ status: "rejected" }),
  ]);

  const byCategoryRaw = await Complaint.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const byCategory = byCategoryRaw.map((row) => ({
    category: row._id,
    count: row.count,
  }));

  const byStatusRaw = await Complaint.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const byStatus = byStatusRaw.map((row) => ({
    status: row._id,
    count: row.count,
  }));

  const trendDays = 7;
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (trendDays - 1));

  const trendRaw = await Complaint.aggregate([
    {
      $match: { createdAt: { $gte: startDate } },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const trendMap = new Map(
    trendRaw.map((row) => {
      const d = new Date(
        Date.UTC(row._id.year, row._id.month - 1, row._id.day)
      );
      return [d.toISOString().slice(0, 10), row.count];
    })
  );

  const recentTrend = [];
  for (let i = 0; i < trendDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    recentTrend.push({ date: key, count: trendMap.get(key) || 0 });
  }

  const resolvedDocs = await Complaint.find({
    status: "resolved",
    "statusHistory.changedAt": { $exists: true },
  }).select("createdAt statusHistory");

  let avgResolutionHours = 0;
  if (resolvedDocs.length > 0) {
    let totalHours = 0;
    let count = 0;
    for (const doc of resolvedDocs) {
      const resolvedEntry = doc.statusHistory.find(
        (h) => h.status === "resolved"
      );
      const resolvedAt = resolvedEntry?.changedAt || doc.updatedAt;
      const hours =
        (new Date(resolvedAt) - new Date(doc.createdAt)) / (1000 * 60 * 60);
      if (hours >= 0) {
        totalHours += hours;
        count++;
      }
    }
    avgResolutionHours = count > 0 ? Math.round(totalHours / count) : 0;
  }

  res.json({
    success: true,
    data: {
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      byCategory,
      byStatus,
      avgResolutionHours,
      recentTrend,
    },
  });
});

exports.bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Please provide at least one complaint id", 400);
  }
  if (ids.length > 200) {
    throw new AppError("Cannot update more than 200 complaints at once", 400);
  }
  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid complaint status", 400);
  }

  const complaints = await Complaint.find({ _id: { $in: ids } });
  const changedAt = new Date();
  const changedBy = req.admin ? req.admin.email : "Admin";

  const updates = complaints.map((c) => {
    if (c.status !== status) {
      if (c.status === "resolved" || c.status === "rejected") {
        throw new AppError(
          `Complaint ${c.complaintId} is closed (${c.status}) and can no longer be updated`,
          400
        );
      }
      c.status = status;
      c.statusHistory.push({
        status,
        note: "",
        changedBy,
        changedAt,
      });
    }
    return c.save();
  });

  await Promise.all(updates);

  res.json({
    success: true,
    message: `${complaints.length} complaint(s) updated to "${status}"`,
    data: { updated: complaints.length },
  });
});

exports.bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Please provide at least one complaint id", 400);
  }
  if (ids.length > 200) {
    throw new AppError("Cannot delete more than 200 complaints at once", 400);
  }

  const complaints = await Complaint.find({ _id: { $in: ids } });

  for (const complaint of complaints) {
    for (const image of complaint.images) {
      const filename = path.basename(image);
      const filePath = path.join(uploadsDir, filename);
      fs.unlink(filePath, () => {});
    }
  }

  const result = await Complaint.deleteMany({ _id: { $in: ids } });

  res.json({
    success: true,
    message: `${result.deletedCount} complaint(s) deleted`,
    data: { deleted: result.deletedCount },
  });
});