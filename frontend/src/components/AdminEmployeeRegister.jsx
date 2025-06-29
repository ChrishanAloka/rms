import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminEmployeeRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    nic: "",
    address: "",
    phone: "",
    basicSalary: "",
    workingHours: 8,
    otHourRate: "",
    bankAccountNo: "",
    role: "cashier"
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://rms-6one.onrender.com/api/auth/employee/register",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Employee registered successfully!");
      navigate("/admin/employees");
    } catch (err) {
      alert("Failed to register employee");
      console.error("Register failed:", err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h3>Register New Employee</h3>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Employee ID *</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="EMP-001"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">NIC *</label>
            <input
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              placeholder="901234567V"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Phone *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0771234567"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Basic Salary *</label>
            <input
              type="number"
              name="basicSalary"
              value={formData.basicSalary}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="e.g., 50000"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Role</option>
              <option value="cashier">Cashier</option>
              <option value="kitchen">Kitchen</option>
              <option value="waiter">Waiter</option>
              <option value="cleaner">Cleaner</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Working Hours (Daily)</label>
            <input
              type="number"
              name="workingHours"
              value={formData.workingHours}
              onChange={handleChange}
              min="0"
              max="24"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">OT Hour Rate (Optional)</label>
            <input
              type="number"
              name="otHourRate"
              value={formData.otHourRate}
              onChange={handleChange}
              step="0.01"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Bank Account No (Optional)</label>
            <input
              type="text"
              name="bankAccountNo"
              value={formData.bankAccountNo}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6 mt-3">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="form-control"
            ></textarea>
          </div>
          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-success w-100">
              Register Employee
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEmployeeRegister;