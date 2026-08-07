import { Routes, Route, Navigate } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout.jsx";
import Home from "./pages/Home.jsx";
import Success from "./pages/Success.jsx";
import Login from "./pages/Login.jsx";
import MyComplaints from "./pages/MyComplaints.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { customer, loading } = useAuth();
  if (loading) return null;
  if (!customer) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/success/:complaintId" element={<Success />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
