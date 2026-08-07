import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  loginCustomer,
  registerCustomer,
  getCustomerProfile,
} from "../services/customerService.js";
import { getErrorMessage } from "../utils/helpers.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("customerToken");
    setCustomer(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const profile = await getCustomerProfile();
        if (!cancelled) setCustomer(profile);
      } catch {
        if (!cancelled) {
          localStorage.removeItem("customerToken");
          setCustomer(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async ({ email, password }) => {
    try {
      const data = await loginCustomer({ email, password });
      localStorage.setItem("customerToken", data.token);
      setCustomer(data.customer);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const data = await registerCustomer({ name, email, password });
      localStorage.setItem("customerToken", data.token);
      setCustomer(data.customer);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  return (
    <AuthContext.Provider
      value={{ customer, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
