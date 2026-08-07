import { Link, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, ClipboardCopy, Home as HomeIcon, Ticket } from "lucide-react";
import { useToast } from "../context/ToastContext.jsx";

export default function Success() {
  const { complaintId } = useParams();
  const { state } = useLocation();
  const complaint = state?.complaint;
  const toast = useToast();

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(complaintId);
      toast.success("Complaint ID copied to clipboard.");
    } catch {
      toast.error("Could not copy ID. Please copy it manually.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="card overflow-hidden text-center animate-scale-in">
        <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-emerald-50 to-white px-6 pb-8 pt-12">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lift">
            <CheckCircle2 size={32} />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Complaint Submitted Successfully!
          </h1>
          <p className="max-w-md text-sm text-slate-500">
            Thank you for reporting the issue. Our support team has received your
            complaint and will review it shortly.
          </p>
        </div>

        <div className="px-6 pb-8">
          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
              Your Complaint ID
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="flex items-center gap-2 text-xl font-extrabold tracking-wide text-brand-700 sm:text-2xl">
                <Ticket size={22} /> {complaintId}
              </span>
              <button
                type="button"
                onClick={copyId}
                className="rounded-lg p-2 text-brand-500 transition-colors hover:bg-brand-100"
                aria-label="Copy complaint ID"
                title="Copy ID"
              >
                <ClipboardCopy size={18} />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Keep this ID safe to track your complaint status in future updates.
            </p>
          </div>

          {complaint && (
            <div className="mt-6 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
              <Info label="Order ID" value={complaint.orderId} />
              <Info label="Product" value={complaint.productName} />
              <Info label="Category" value={complaint.category} />
              <Info label="Status" value="Pending" />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/" className="btn-primary w-full sm:w-auto">
              <HomeIcon size={16} /> Submit Another Complaint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800" title={value}>
        {value}
      </p>
    </div>
  );
}