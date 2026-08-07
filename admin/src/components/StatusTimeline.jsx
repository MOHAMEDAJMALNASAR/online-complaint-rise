import { statusMeta } from "../utils/helpers.js";
import { formatDateTime } from "../utils/format.js";

const DOT_COLORS = {
  pending: "bg-amber-500 ring-amber-100",
  "in-progress": "bg-sky-500 ring-sky-100",
  resolved: "bg-emerald-500 ring-emerald-100",
  rejected: "bg-rose-500 ring-rose-100",
};

export default function StatusTimeline({ history }) {
  const entries = history || [];

  if (entries.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-400">
        No status changes recorded yet
      </p>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
  );

  return (
    <ol className="relative space-y-0">
      {sorted.map((entry, i) => {
        const meta = statusMeta(entry.status);
        const isLast = i === sorted.length - 1;
        return (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span className="absolute left-[11px] top-7 bottom-0 w-px bg-slate-200" />
            )}
            <span
              className={`relative z-10 mt-1 h-[22px] w-[22px] shrink-0 rounded-full ring-4 ${DOT_COLORS[entry.status] || "bg-slate-400 ring-slate-100"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={`badge border ${meta.color}`}>{meta.label}</span>
                {entry.changedBy && (
                  <span className="text-xs text-slate-400">by {entry.changedBy}</span>
                )}
                <span className="ml-auto text-xs font-medium text-slate-400">
                  {formatDateTime(entry.changedAt)}
                </span>
              </div>
              {entry.note && (
                <p className="mt-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-600">
                  {entry.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}