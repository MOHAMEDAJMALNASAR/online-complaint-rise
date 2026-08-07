import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  FileText,
  Download,
  X,
  Trash2,
  CheckSquare,
  Square,
  Eye,
} from "lucide-react";
import {
  getComplaints,
  bulkUpdateStatus,
  bulkDelete,
} from "../services/adminService.js";
import { useToast } from "../context/ToastContext.jsx";
import { getErrorMessage, STATUSES } from "../utils/helpers.js";
import { formatDate } from "../utils/format.js";
import Loader from "../components/Loader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";

const ALL_LIMIT = 500;

export default function Complaints() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlStatus = searchParams.get("status") || "all";

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: ALL_LIMIT, sort };
      if (search.trim()) params.search = search.trim();
      if (urlStatus !== "all") params.status = urlStatus;
      const result = await getComplaints(params);
      setData(result);
      setSelected(new Set());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [search, urlStatus, sort, toast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchComplaints(), 300);
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  const complaints = data?.complaints || [];
  const pagination = data?.pagination || null;
  const hasActiveFilters = search || urlStatus !== "all";

  const changeStatusFilter = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearch("");
    setSort("newest");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const toggleAll = () => {
    if (selected.size === complaints.length && complaints.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(complaints.map((c) => c._id)));
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || selected.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await bulkUpdateStatus([...selected], bulkStatus);
      toast.success(res.message);
      setBulkStatus("");
      fetchComplaints();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBulkLoading(false);
    }
  };

  const confirmBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const res = await bulkDelete([...selected]);
      toast.success(res.message);
      setDeleteOpen(false);
      fetchComplaints();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBulkLoading(false);
    }
  };

  const exportCsv = () => {
    if (complaints.length === 0) {
      toast.info("Nothing to export.");
      return;
    }
    const headers = [
      "Complaint ID",
      "Customer Name",
      "Mobile",
      "Email",
      "Order ID",
      "Product Name",
      "Category",
      "Status",
      "Created At",
    ];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = complaints.map((r) =>
      [
        r.complaintId,
        r.customerName,
        r.mobile,
        r.email,
        r.orderId,
        r.productName,
        r.category,
        r.status,
        formatDate(r.createdAt),
      ]
        .map(escape)
        .join(",")
    );
    const csv = [headers.map(escape).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaints.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${complaints.length} complaints exported.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Manage Complaints
          </h2>
          <p className="text-sm text-slate-500">
            {loading ? "Loading..." : `${pagination?.total ?? 0} complaints found`}
          </p>
        </div>
        <button type="button" onClick={exportCsv} className="btn-outline !px-4 !py-2 text-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Complaint ID, Customer Name, or Order ID..."
              className="input-base !pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3">
            <select
              value={urlStatus}
              onChange={(e) => changeStatusFilter(e.target.value)}
              className="input-base !py-2 sm:w-44"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-base !py-2 sm:w-40"
              aria-label="Sort order"
            >
              <option value="newest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              Filters applied
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <X size={13} /> Clear all
            </button>
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/80 px-4 py-3 animate-scale-in">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800">
            <CheckSquare size={16} />
            {selected.size} selected
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="input-base !w-auto !py-1.5 text-sm"
              aria-label="Bulk status"
            >
              <option value="">Change status to...</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleBulkStatus}
              disabled={!bulkStatus || bulkLoading}
              className="btn !px-3 !py-1.5 text-sm bg-brand-600 text-white hover:bg-brand-700"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={bulkLoading}
              className="btn !px-3 !py-1.5 text-sm border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100"
          >
            <X size={13} /> Clear
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="w-12 px-4 py-3.5">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-slate-400 transition-colors hover:text-brand-600"
                    aria-label="Select all rows"
                  >
                    {selected.size === complaints.length && complaints.length > 0 ? (
                      <CheckSquare size={17} className="text-brand-600" />
                    ) : (
                      <Square size={17} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3.5">Complaint ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1">
                    Date <ArrowUpDown size={12} />
                  </span>
                </th>
                <th className="px-5 py-3.5">Status</th>
                <th className="w-12 px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading &&
                complaints.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/admin/complaints/${c._id}`)}
                    className={`group cursor-pointer transition-colors ${
                      selected.has(c._id) ? "bg-brand-50/60" : "hover:bg-brand-50/30"
                    }`}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleOne(c._id)}
                        className="text-slate-400 transition-colors hover:text-brand-600"
                        aria-label="Select row"
                      >
                        {selected.has(c._id) ? (
                          <CheckSquare size={17} className="text-brand-600" />
                        ) : (
                          <Square size={17} />
                        )}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-brand-600">
                      {c.complaintId}
                    </td>
                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap font-medium text-slate-800">
                        {c.customerName}
                      </p>
                      <p className="text-xs text-slate-400">{c.mobile}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {c.orderId}
                    </td>
                    <td className="max-w-[160px] truncate px-5 py-4 text-slate-600">
                      {c.productName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {c.category}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 opacity-0 transition-all group-hover:bg-brand-600 group-hover:text-white group-hover:opacity-100">
                        View <Eye size={13} />
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader label="Loading complaints..." />
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState />
          ) : null}
        </div>

        {!loading && complaints.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <FileText size={14} />
              <span>{pagination.total} complaints found</span>
            </div>
          </div>
        )}
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Complaints">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">{selected.size} complaint(s)</span>?
            This action cannot be undone and will also remove their uploaded images.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="btn-outline"
              disabled={bulkLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmBulkDelete}
              disabled={bulkLoading}
              className="btn border-rose-600 bg-rose-600 text-white hover:bg-rose-700"
            >
              {bulkLoading ? "Deleting..." : `Delete ${selected.size}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}