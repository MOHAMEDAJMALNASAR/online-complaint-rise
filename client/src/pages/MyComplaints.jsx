import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, FilePlus2, Package, Hash, Calendar, Mail } from "lucide-react";
import { getMyComplaints } from "../services/customerService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getErrorMessage } from "../utils/helpers.js";
import StatusInfoBox from "../components/StatusInfoBox.jsx";
import Loader from "../components/Loader.jsx";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MyComplaints() {
  const { customer, loading: authLoading } = useAuth();
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getMyComplaints();
        if (!cancelled) setComplaints(data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (authLoading || loading) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            My Complaints
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-700">{customer?.name}</span>. Here is the current status of your complaints.
          </p>
        </div>
        <Link to="/" className="btn-primary">
          <FilePlus2 size={16} /> Register New Complaint
        </Link>
      </div>

      {complaints.length === 0 ? (
        <div className="card mt-10 flex flex-col items-center gap-4 px-6 py-16 text-center animate-fade-in-up">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Ticket size={30} />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              No complaints yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              You haven't registered any complaints. Register one and its status
              will appear here.
            </p>
          </div>
          <Link to="/" className="btn-primary">
            <FilePlus2 size={16} /> Register Your First Complaint
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {complaints.map((complaint) => (
            <article
              key={complaint._id}
              className="card overflow-hidden animate-fade-in-up"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5 font-mono font-semibold text-brand-700">
                    <Hash size={14} /> {complaint.complaintId}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Package size={14} /> {complaint.productName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> {formatDate(complaint.createdAt)}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {complaint.category}
                </span>
              </div>

              <div className="space-y-4 px-5 py-5">
                <p className="text-sm text-slate-600">{complaint.description}</p>
                <StatusInfoBox
                  status={complaint.status}
                  adminNote={complaint.adminNote}
                />
                {complaint.email && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail size={13} /> Updates are sent to {complaint.email}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
