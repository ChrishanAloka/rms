// src/components/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://rms-6one.onrender.com/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_report.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const input = document.getElementById("user-table");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 210;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("users_report.pdf");
    });
  };

  // Update user role
  const handleRoleChange = async (id, newRole) => {
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `https://rms-6one.onrender.com/api/auth/user/${id}/role`,
      { role: newRole },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setUsers((prev) =>
      prev.map((user) =>
        user._id === id ? { ...user, role: res.data.role } : user
      )
    );
  };

  // Deactivate user
  const handleDeactivate = async (id) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `https://rms-6one.onrender.com/api/auth/user/${id}/deactivate`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setUsers((prev) =>
      prev.filter((user) => user._id !== id)
    );
  };

  return (
    <div>
      <h2>User Management</h2>

      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-success me-2" onClick={exportToExcel}>
          Export to Excel
        </button>
        <button className="btn btn-danger" onClick={exportToPDF}>
          Export to PDF
        </button>
      </div>

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className="form-select"
                  disabled={!user.isActive}
                >
                  <option value="admin">Admin</option>
                  <option value="cashier">Cashier</option>
                  <option value="kitchen">Kitchen</option>
                </select>
              </td>
              <td>
                <span
                  className={
                    user.isActive
                      ? "badge bg-success"
                      : "badge bg-secondary"
                  }
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                {!user.isActive ? (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => alert("Reactivate feature coming soon")}
                  >
                    Reactivate
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeactivate(user._id)}
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;