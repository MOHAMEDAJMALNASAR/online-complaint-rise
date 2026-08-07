const mongoose = require("mongoose");

const complaintStatusEnum = [
  "pending",
  "in-progress",
  "resolved",
  "rejected",
];

const complaintCategoryEnum = [
  "Damaged Product",
  "Wrong Product",
  "Missing Item",
  "Product Quality Issue",
  "Other",
];

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[+]?[0-9\s\-]{7,15}$/, "Please provide a valid mobile number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    orderId: {
      type: String,
      required: [true, "Order ID is required"],
      trim: true,
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Complaint category is required"],
      enum: complaintCategoryEnum,
    },
    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    images: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: complaintStatusEnum,
      default: "pending",
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1500, "Admin note cannot exceed 1500 characters"],
    },
    statusHistory: {
      type: [
        {
          status: {
            type: String,
            enum: complaintStatusEnum,
            required: true,
          },
          note: {
            type: String,
            trim: true,
            default: "",
          },
          changedBy: {
            type: String,
            trim: true,
            default: "System",
          },
          changedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ customerName: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
module.exports.ComplaintStatus = complaintStatusEnum;
module.exports.ComplaintCategory = complaintCategoryEnum;