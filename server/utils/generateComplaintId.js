const Complaint = require("../models/Complaint");

const usedSuffixes = new Set();

function randomSuffix(length) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateComplaintId() {
  const prefix = "CMP";
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = randomSuffix(8);
    if (usedSuffixes.has(suffix)) continue;
    const candidate = `${prefix}-${suffix}`;
    const exists = await Complaint.exists({ complaintId: candidate });
    if (!exists) {
      usedSuffixes.add(suffix);
      return candidate;
    }
  }
  const fallback = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  return fallback;
}

module.exports = generateComplaintId;