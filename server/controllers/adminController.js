const Admin = require("../models/Admin");
const { signToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

async function ensureDefaultAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@complaints.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await Admin.findOne({ email });
  if (!existing) {
    await Admin.create({ email, password });
    console.log(`Default admin created: ${email}`);
  }
}

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ id: admin._id, email: admin.email, role: "admin" });

  res.json({
    success: true,
    message: "Login successful",
    data: { token, admin: { id: admin._id, email: admin.email } },
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select("-password");
  if (!admin) {
    throw new AppError("Admin not found", 404);
  }
  res.json({ success: true, data: admin });
});

exports.ensureDefaultAdmin = ensureDefaultAdmin;