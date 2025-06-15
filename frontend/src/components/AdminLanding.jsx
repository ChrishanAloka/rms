// src/components/AdminLanding.jsx
// AdminLanding.jsx
import React, { useState } from "react";
import { useAuth } from "./ProtectedRoute";        // Correct
import { useNavigate, Link } from "react-router-dom";    // Correct

const AdminLanding = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
<div
  className={`bg-dark text-white p-3 ${sidebarOpen ? "d-block" : "d-none"}`}
  style={{ width: "250px" }}
>
  <h4 className="mb-4">Admin Panel</h4>
  <ul className="nav flex-column">
    <li className="nav-item mb-2">
      <Link to="/admin" className="nav-link text-white">
        Dashboard
      </Link>
    </li>
    <li className="nav-item mb-2">
      <Link to="/admin/users" className="nav-link text-white">
        Users
      </Link>
    </li>
    <li className="nav-item mb-2">
      <Link to="/admin/signup-key" className="nav-link text-white">
        Signup Key
      </Link>
    </li>
  </ul>
</div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Navbar */}
        <nav className="navbar navbar-light bg-light shadow-sm">
          <div className="container-fluid">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <span className="navbar-text ms-auto">
              👤 Hello, <strong>{user?.role}</strong>
              <button
                className="btn btn-danger btn-sm ms-3"
                onClick={handleLogout}
              >
                Logout
              </button>
            </span>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4 overflow-auto flex-grow-1">
          <h2>User Management</h2>
          <p>Welcome to the admin dashboard.</p>

          {/* Replace this with real table later */}
          <table className="table table-striped table-bordered mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>john@example.com</td>
                <td><span className="badge bg-primary">Cashier</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLanding;