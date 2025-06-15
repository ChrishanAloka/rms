// src/components/KitchenLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const KitchenLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.role === "kitchen") {
        localStorage.setItem("token", res.data.token);
        setTimeout(() => {
        navigate("/kitchen");
        }, 1000); // Wait for context/state to update
      } else {
        alert("Unauthorized access");
      }
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h4 className="text-center mb-4">Kitchen Login</h4>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>

        <hr />

        <p className="text-center mb-0">
          Don't have an account?{" "}
          <Link to="/signup?role=kitchen" className="text-decoration-none">
            Sign Up
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
};

export default KitchenLogin;