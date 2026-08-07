import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Headphones,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CATEGORIES } from "../utils/helpers.js";
import { submitComplaint } from "../services/complaintService.js";
import { useToast } from "../context/ToastContext.jsx";
import { validateComplaintForm } from "../utils/validation.js";
import { getErrorMessage } from "../utils/helpers.js";
import ImageUploader from "../components/ImageUploader.jsx";

const initialValues = {
  customerName: "",
  mobile: "",
  email: "",
  orderId: "",
  productName: "",
  category: "",
  description: "",
};

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateComplaintForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const formData = new FormData();
    formData.append("customerName", values.customerName.trim());
    formData.append("mobile", values.mobile.trim());
    formData.append("email", values.email.trim());
    formData.append("orderId", values.orderId.trim());
    formData.append("productName", values.productName.trim());
    formData.append("category", values.category);
    formData.append("description", values.description.trim());
    images.forEach((img) => formData.append("images", img.file));

    setSubmitting(true);
    try {
      const complaint = await submitComplaint(formData);
      toast.success(`Complaint submitted successfully! Your ID is ${complaint.complaintId}`);
      navigate(`/success/${complaint.complaintId}`, { state: { complaint } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    setImages([]);
    toast.info("Form has been reset.");
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-br from-brand-50 via-white to-white" />

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
            <Headphones size={14} /> 24/7 Complaint Support
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Register a Product Complaint
          </h1>
          <p className="mt-3 text-slate-500 sm:text-base">
            Facing an issue with a delivered product? Fill in the details below and
            our support team will get back to you shortly.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card mt-10 overflow-hidden animate-fade-in-up"
          noValidate
        >
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8">
            <h2 className="text-base font-bold text-slate-900">Complaint Details</h2>
            <p className="text-sm text-slate-500">
              Please provide accurate information to help us resolve your issue faster.
            </p>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="customerName" className="label">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={values.customerName}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
                  className="input-base"
                  autoComplete="name"
                />
                <FieldError message={errors.customerName} />
              </div>

              <div>
                <label htmlFor="mobile" className="label">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={values.mobile}
                  onChange={handleChange}
                  placeholder="e.g. +1 555 123 4567"
                  className="input-base"
                  autoComplete="tel"
                />
                <FieldError message={errors.mobile} />
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email Address <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className="input-base"
                  autoComplete="email"
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <label htmlFor="orderId" className="label">
                  Order ID <span className="text-rose-500">*</span>
                </label>
                <input
                  id="orderId"
                  name="orderId"
                  type="text"
                  value={values.orderId}
                  onChange={handleChange}
                  placeholder="e.g. ORD-10293847"
                  className="input-base"
                />
                <FieldError message={errors.orderId} />
              </div>

              <div>
                <label htmlFor="productName" className="label">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="productName"
                  name="productName"
                  type="text"
                  value={values.productName}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Headphones"
                  className="input-base"
                />
                <FieldError message={errors.productName} />
              </div>

              <div>
                <label htmlFor="category" className="label">
                  Complaint Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  className="input-base appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%22%20height=%2216%22%20fill=%22none%22%20stroke=%22%2364748b%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpath%20d=%22m4%206%204%204%204-4%22/%3E%3C/svg%3E')] bg-[right_0.75rem_center] bg-no-repeat pr-9"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.category} />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="label">
                Complaint Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={values.description}
                onChange={handleChange}
                rows={5}
                placeholder="Please describe the issue you are facing in detail..."
                className="input-base resize-none"
              />
              <div className="mt-1 flex items-center justify-between">
                <FieldError message={errors.description} />
                <span className="ml-auto text-xs text-slate-400">
                  {values.description.length} / 2000
                </span>
              </div>
            </div>

            <div>
              <span className="label">Upload Product Images</span>
              <ImageUploader images={images} onChange={setImages} />
            </div>

            <div className="mt-2 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="btn-outline w-full sm:w-auto"
                disabled={submitting}
              >
                <RotateCcw size={16} /> Reset Form
              </button>
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit Complaint
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-500 sm:flex-row sm:gap-8 animate-fade-in-up">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" /> Complaints handled in 24–48 hours
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" /> Secure &amp; confidential
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" /> Track with a unique ID
          </span>
        </div>
      </div>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
      <AlertCircle size={13} /> {message}
    </p>
  );
}