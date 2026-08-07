const Customer = require("../models/Customer");
const Complaint = require("../models/Complaint");
const { signToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await Customer.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const customer = await Customer.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  const token = signToken({
    id: customer._id,
    email: customer.email,
    role: "customer",
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      token,
      customer: { id: customer._id, name: customer.name, email: customer.email },
    },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const customer = await Customer.findOne({ email: email.trim().toLowerCase() });
  if (!customer) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await customer.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({
    id: customer._id,
    email: customer.email,
    role: "customer",
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      customer: { id: customer._id, name: customer.name, email: customer.email },
    },
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer.id).select(
    "-password"
  );
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }
  res.json({ success: true, data: customer });
});

exports.getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({
    $or: [{ customer: req.customer.id }, { email: req.customer.email }],
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: complaints });
});
