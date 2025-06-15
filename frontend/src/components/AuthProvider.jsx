// src/components/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser(decoded);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      }
    } else {
      setUser(null);
      navigate("/login");
    }
  }, [navigate]);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    const decoded = JSON.parse(atob(data.token.split(".")[1]));
    setUser(decoded);
    navigate(`/${decoded.role}`);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used inside AuthProvider");
  return context;
};