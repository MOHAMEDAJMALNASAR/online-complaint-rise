import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { validateLoginForm, validateRegisterForm } from "../utils/validation.js";

const initialLogin = { email: "", password: "" };
const initialRegister = { name: "", email: "", password: "" };

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, register, customer } = useAuth();

  const [mode, setMode] = useState("login");
  const [loginValues, setLoginValues] = useState(initialLogin);
  const [registerValues, setRegisterValues] = useState(initialRegister);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const values = mode === "login" ? loginValues : registerValues;
    const validator = mode === "login" ? validateLoginForm : validateRegisterForm;
    const validationErrors = validator(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result =
        mode === "login"
          ? await login(values)
          : await register(values);
      if (result.success) {
        toast.success(
          mode === "login" ? "Welcome back!" : "Account created successfully!"
        );
        navigate("/my-complaints");
      } else {
        toast.error(result.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (customer) {
    navigate("/my-complaints", { replace: true });
    return null;
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-br from-brand-50 via-white to-white" />

      <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="card overflow-hidden animate-fade-in-up">
          <div className="flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                mode === "login"
                  ? "border-b-2 border-brand-600 bg-white text-brand-700"
                  : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                mode === "register"
                  ? "border-b-2 border-brand-600 bg-white text-brand-700"
                  : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold text-slate-900">
                {mode === "login" ? "Customer Login" : "Create Your Account"}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                {mode === "login"
                  ? "Login to track the status of your complaints."
                  : "Register to track the status of your complaints."}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === "register" && (
                <div>
                  <label htmlFor="name" className="label">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={registerValues.name}
                    onChange={handleRegisterChange}
                    placeholder="e.g. John Smith"
                    className="input-base"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={mode === "login" ? loginValues.email : registerValues.email}
                  onChange={mode === "login" ? handleLoginChange : handleRegisterChange}
                  placeholder="e.g. john@example.com"
                  className="input-base"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={mode === "login" ? loginValues.password : registerValues.password}
                  onChange={mode === "login" ? handleLoginChange : handleRegisterChange}
                  placeholder="••••••••"
                  className="input-base"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {mode === "login" ? "Logging in..." : "Creating account..."}
                  </>
                ) : mode === "login" ? (
                  <>
                    <LogIn size={16} /> Login
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Create Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Your complaints stay linked to your email address so you can always
          track their status.
        </p>
      </div>
    </div>
  );
}
