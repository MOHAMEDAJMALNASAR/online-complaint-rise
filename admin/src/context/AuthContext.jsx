import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { adminLogin } from "../services/adminService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_user")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem("admin_token", token);
    else localStorage.removeItem("admin_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("admin_user", JSON.stringify(user));
    else localStorage.removeItem("admin_user");
  }, [user]);

  const login = useCallback(async (email, password) => {
    const data = await adminLogin(email, password);
    setToken(data.token);
    setUser(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout }),
    [token, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}