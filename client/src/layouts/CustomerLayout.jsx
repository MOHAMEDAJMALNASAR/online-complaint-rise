import { Outlet, Link, useNavigate } from "react-router-dom";
import { Ticket, LogIn, LogOut, ClipboardList } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function CustomerLayout() {
  const { customer, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Ticket size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Support<span className="text-brand-600">Desk</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1.5">
            {customer ? (
              <>
                <Link
                  to="/my-complaints"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  <ClipboardList size={16} /> My Complaints
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                <LogIn size={16} /> Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/70 py-6">
        <div className="mx-auto w-full max-w-5xl px-4 text-center text-sm text-slate-400 sm:px-6">
          © {new Date().getFullYear()} SupportDesk · Online Product Complaint Management System
        </div>
      </footer>
    </div>
  );
}
