export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
}

export const CATEGORIES = [
  "Damaged Product",
  "Wrong Product",
  "Missing Item",
  "Product Quality Issue",
  "Other",
];

export const STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "in-progress", label: "In Progress", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "resolved", label: "Resolved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "rejected", label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-200" },
];

export function statusMeta(value) {
  return (
    STATUSES.find((s) => s.value === value) || {
      value,
      label: value,
      color: "bg-slate-100 text-slate-700 border-slate-200",
    }
  );
}