import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { getComplaintStats, getComplaints } from "../services/adminService.js";
import { useToast } from "../context/ToastContext.jsx";
import { getErrorMessage } from "../utils/helpers.js";
import { formatDate } from "../utils/format.js";
import Loader from "../components/Loader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import useFetch from "../hooks/useFetch.js";

export default function Dashboard() {
  const toast = useToast();
  const navigate = useNavigate();

  const stats = useFetch(getComplaintStats);
  const recent = useFetch(() => getComplaints({ limit: 6 }));

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([stats.run(), recent.run()]);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = stats.loading;

  const statCards = [
    { label: "Total Complaints", value: stats.data?.total, icon: Ticket, color: "bg-brand-50 text-brand-600", status: "all" },
    { label: "Pending", value: stats.data?.pending, icon: Clock, color: "bg-amber-50 text-amber-600", status: "pending" },
    { label: "In Progress", value: stats.data?.inProgress, icon: Loader2, color: "bg-sky-50 text-sky-600", status: "in-progress" },
    { label: "Resolved", value: stats.data?.resolved, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", status: "resolved" },
    { label: "Rejected", value: stats.data?.rejected, icon: XCircle, color: "bg-rose-50 text-rose-600", status: "rejected" },
  ];

  const openStatus = (status) => {
    if (status === "all") navigate("/admin/complaints");
    else navigate(`/admin/complaints?status=${status}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Overview</h2>
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <TrendingUp size={15} className="text-emerald-500" />
            Click a card to view its complaints
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/complaints")}
          className="btn-primary !px-4 !py-2 text-sm"
        >
          Manage Complaints <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => openStatus(card.status)}
            className="group card flex flex-col gap-3 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex items-start justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon size={20} />
              </span>
              <ArrowUpRight
                size={16}
                className="text-slate-300 transition-all duration-200 group-hover:text-brand-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {isLoading ? <SkeletonLine /> : card.value}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Complaints</h3>
            <p className="text-xs text-slate-500">Latest submissions across all statuses</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/complaints")}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all <ArrowRight size={15} />
          </button>
        </div>

        {recent.loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader label="Loading complaints..." />
          </div>
        ) : recent.data?.complaints?.length ? (
          <div className="divide-y divide-slate-100">
            {recent.data.complaints.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => navigate(`/admin/complaints/${c._id}`)}
                className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:flex">
                  <Ticket size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-mono text-sm font-semibold text-brand-600">
                      {c.complaintId}
                    </span>
                    <span className="truncate text-sm font-medium text-slate-700">
                      {c.customerName}
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-400">{c.productName}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium text-slate-500">{formatDate(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function SkeletonLine() {
  return <span className="inline-block h-6 w-12 animate-pulse rounded bg-slate-200" />;
}