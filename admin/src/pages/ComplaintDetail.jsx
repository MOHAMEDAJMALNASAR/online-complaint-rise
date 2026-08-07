import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Package,
  Hash,
  Tag,
  Calendar,
  AlertTriangle,
  Save,
  Trash2,
  ClipboardList,
  ClipboardCopy,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { getComplaint, updateComplaint, deleteComplaint } from "../services/adminService.js";
import { useToast } from "../context/ToastContext.jsx";
import { getErrorMessage, STATUSES } from "../utils/helpers.js";
import { formatDateTime } from "../utils/format.js";
import Loader from "../components/Loader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ImageGallery from "../components/ImageGallery.jsx";
import Modal from "../components/Modal.jsx";

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [note, setNote] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const c = await getComplaint(id);
        setComplaint(c);
        setStatusValue(c.status);
        setNote(c.adminNote || "");
      } catch (error) {
        toast.error(getErrorMessage(error));
        navigate("/admin/complaints");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader label="Loading complaint details..." />
      </div>
    );
  }

  if (!complaint) return null;

  const applyStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const updated = await updateComplaint(complaint._id, { status: newStatus });
      setComplaint(updated);
      setStatusValue(updated.status);
      toast.success(`Status changed to "${newStatus}".`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  const saveChanges = async () => {
    setUpdating(true);
    try {
      const payload = {};
      if (statusValue !== complaint.status) payload.status = statusValue;
      if (note !== complaint.adminNote) payload.adminNote = note;
      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save.");
        return;
      }
      const updated = await updateComplaint(complaint._id, payload);
      setComplaint(updated);
      setStatusValue(updated.status);
      setNote(updated.adminNote || "");
      toast.success("Complaint updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteComplaint(complaint._id);
      toast.success("Complaint deleted.");
      setDeleteOpen(false);
      navigate("/admin/complaints");
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeleting(false);
    }
  };

  const copyComplaintId = async () => {
    try {
      await navigator.clipboard.writeText(complaint.complaintId);
      toast.success("Complaint ID copied.");
    } catch {
      toast.error("Could not copy ID.");
    }
  };

  const isClosed =
    complaint.status === "resolved" || complaint.status === "rejected";
  const noteLocked = isClosed || Boolean(complaint.adminNote?.trim());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/complaints"
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-white hover:text-brand-600"
            aria-label="Back to complaints"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-brand-600">
              {complaint.complaintId}
            </p>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Complaint Details
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={copyComplaintId}
            className="btn-outline !px-3 !py-2 text-xs"
            title="Copy complaint ID"
          >
            <ClipboardCopy size={15} /> Copy ID
          </button>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <User size={16} className="text-brand-600" /> Customer Information
              </h3>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <InfoItem icon={User} label="Customer Name" value={complaint.customerName} />
              <InfoItem icon={Phone} label="Mobile Number" value={complaint.mobile} />
              <InfoItem icon={Mail} label="Email Address" value={complaint.email || "Not provided"} />
              <InfoItem icon={Calendar} label="Submitted" value={formatDateTime(complaint.createdAt)} />
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ClipboardList size={16} className="text-brand-600" /> Order Information
              </h3>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <InfoItem icon={Hash} label="Order ID" value={complaint.orderId} mono />
              <InfoItem icon={Tag} label="Category" value={complaint.category} />
              <InfoItem icon={Package} label="Product Name" value={complaint.productName} />
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <AlertTriangle size={16} className="text-amber-500" /> Complaint Description
              </h3>
            </div>
            <div className="p-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {complaint.description}
              </p>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Tag size={16} className="text-brand-600" /> Uploaded Images
              </h3>
            </div>
            <div className="p-6">
              <ImageGallery images={complaint.images} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
              <Lock size={16} className="text-brand-600" /> Update Status
            </h3>
            {isClosed ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center">
                <CheckCircle2 size={26} className="text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-800">
                  This complaint is closed ({complaint.status === "resolved" ? "Resolved" : "Rejected"})
                </p>
                <p className="text-xs text-emerald-700/70">
                  Status can no longer be changed for closed complaints.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => applyStatus("pending")}
                  disabled={updating || complaint.status === "pending"}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100 active:scale-[0.97] disabled:opacity-50"
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => applyStatus("in-progress")}
                  disabled={updating || complaint.status === "in-progress"}
                  className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-semibold text-sky-700 transition-all hover:bg-sky-100 active:scale-[0.97] disabled:opacity-50"
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => applyStatus("resolved")}
                  disabled={updating || complaint.status === "resolved"}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-[0.97] disabled:opacity-50"
                >
                  Resolved
                </button>
                <button
                  type="button"
                  onClick={() => applyStatus("rejected")}
                  disabled={updating || complaint.status === "rejected"}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition-all hover:bg-rose-100 active:scale-[0.97] disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
            {updating && !isClosed && (
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
                Updating status...
              </p>
            )}
          </section>

          {!noteLocked && (
            <section className="card p-6">
              <h3 className="mb-1 text-sm font-bold text-slate-900">Admin Notes</h3>
              <p className="mb-3 text-xs text-slate-400">
                Add internal notes about this complaint.
              </p>
              {!isClosed && (
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="input-base mb-3"
                  aria-label="Set status"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Write an admin note about this complaint..."
                className="input-base resize-none"
              />
              <button
                type="button"
                onClick={saveChanges}
                disabled={updating}
                className="btn-primary mt-4 w-full"
              >
                <Save size={16} /> Save Changes
              </button>
            </section>
          )}

          {!isClosed && (
            <section className="card border-rose-100 p-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-700">
                <AlertTriangle size={16} /> Danger Zone
              </h3>
              <p className="mb-4 text-xs text-slate-400">
                Deleting a complaint is permanent and cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="btn w-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                <Trash2 size={16} /> Delete Complaint
              </button>
            </section>
          )}
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Complaint"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete complaint{" "}
            <span className="font-mono font-semibold text-brand-700">
              {complaint.complaintId}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="btn-outline"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="btn border-rose-600 bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, mono }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={13} /> {label}
      </p>
      <p
        className={`mt-1 break-words ${mono ? "font-mono text-sm font-semibold text-brand-700" : "text-sm font-medium text-slate-800"}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
