import { Clock, Wrench, CheckCircle2, XCircle } from "lucide-react";
import { statusMeta } from "../utils/helpers.js";

const STATUS_CONTENT = {
  pending: {
    icon: Clock,
    accent: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    headline: "Complaint Awaiting Review",
    description:
      "We have received your complaint and our team will review it shortly.",
  },
  "in-progress": {
    icon: Wrench,
    accent: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    headline: "Complaint In Progress",
    description:
      "Our support team is currently working on resolving your complaint.",
  },
  resolved: {
    icon: CheckCircle2,
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    headline: "Complaint Resolved",
    description:
      "Your complaint has been resolved. Thank you for your patience.",
  },
  rejected: {
    icon: XCircle,
    accent: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    headline: "Complaint Rejected",
    description:
      "Unfortunately, we were unable to process your complaint.",
  },
};

export default function StatusInfoBox({ status, adminNote }) {
  const meta = statusMeta(status);
  const content =
    STATUS_CONTENT[status] || STATUS_CONTENT.pending;
  const Icon = content.icon;

  return (
    <div
      className={`rounded-xl border ${content.border} ${content.bg} px-4 py-4`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ${content.accent}`}
        >
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {content.headline}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}
            >
              {meta.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{content.description}</p>
          {adminNote && (
            <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                Update from our team:
              </span>{" "}
              {adminNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
