// ProtectedRoute.jsx ✅ Good Version
import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

// ✅ Only one export of useAuth
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token on load:", token); // ✅ Log this

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser(decoded);
        console.log("Decoded user:", decoded); // ✅ What does it show?
      } catch (e) {
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    const decoded = JSON.parse(atob(data.token.split(".")[1]));
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
// ProtectedRoute.jsx
// ProtectedRoute.jsx
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    // Not logged in → go to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in but not authorized → go to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}