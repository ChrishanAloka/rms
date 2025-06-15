import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./ProtectedRoute";

const RoleLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get user role from AuthContext
  const { user, logout } = useAuth();

  const renderSidebarMenu = () => {
    switch (user?.role) {
      case "admin":
        return (
          <>
            <li className="nav-item mb-2">
              <Link to="/admin" className="nav-link text-white">Dashboard</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin/users" className="nav-link text-white">User Management</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin/signup-key" className="nav-link text-white">Generate Signup Key</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin/bills" className="nav-link text-white">Bills</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin/report" className="nav-link text-white">Reports</Link>
            </li>
          </>
        );
      case "cashier":
        return (
          <>
            <li className="nav-item mb-2">
              <Link to="/cashier" className="nav-link text-white">Sales Dashboard</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/cashier/orders" className="nav-link text-white">Order History</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/cashier/today" className="nav-link text-white">View Today</Link>
            </li>
          </>
        );
      case "kitchen":
        return (
          <>
            <li className="nav-item mb-2">
              <Link to="/kitchen" className="nav-link text-white">Live Orders</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/kitchen/history" className="nav-link text-white">Order History</Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/kitchen/menu" className="nav-link text-white">Manage Menu</Link>
            </li>
            
            
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div
        className={`bg-dark text-white p-3 ${sidebarOpen ? "d-block" : "d-none"}`}
        style={{ width: "250px", height: "100vh" }}
      >
        <h4 className="mb-4">RMS Panel</h4>
        <ul className="nav flex-column">
          {renderSidebarMenu()}
        </ul>
      </div>

      {/* Main Content Area */}
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
              👤 {user?.role}
              <button
                className="btn btn-danger btn-sm ms-3"
                onClick={logout}
              >
                Logout
              </button>
            </span>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-4 overflow-auto flex-grow-1 bg-light">
          <Outlet /> {/* Renders child routes dynamically */}
        </main>
      </div>
    </div>
  );
};

export default RoleLayout;