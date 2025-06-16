// src/context/auth-context.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUser(decoded);
    } catch (err) {
      console.error("Invalid token:", err.message);
      localStorage.removeItem("token");
    }

    setLoading(false);
  }, []);

  const login = async (data) => {
    localStorage.setItem("token", data.token);
    const decoded = JSON.parse(atob(data.token.split(".")[1]));
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used inside AuthProvider");
  return context;
};