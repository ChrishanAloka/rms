// src/components/KitchenBills.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const KitchenBills = () => {
  const [bills, setBills] = useState([]);
  const [newBill, setNewBill] = useState({
    type: "Gas",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });

  const [editingBill, setEditingBill] = useState(null);
  const [editData, setEditData] = useState({ ...newBill });
  const [loading, setLoading] = useState(false);

  // Load all bills on mount
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("https://rms-6one.onrender.com/api/auth/kitchen/bills", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBills(res.data);
    } catch (err) {
      console.error("Failed to load bills:", err.message);
      toast.error("Failed to load kitchen bills");
    }
  };

  // Handle form input change
  const handleChange = (e) =>
    setNewBill({ ...newBill, [e.target.name]: e.target.value });

  // Submit new bill
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { type, amount, date } = newBill;

    if (!type || !amount || !date) {
      alert("Type, Amount, and Date are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://rms-6one.onrender.com/api/auth/kitchen/bill",
        newBill,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBills([res.data, ...bills]);
      setNewBill({
        type: "Gas",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });

      toast.success("Bill added successfully!");
    } catch (err) {
      console.error("Add failed:", err.response?.data || err.message);
      toast.error("Failed to add bill");
    }
  };

  // Open edit modal
  const openEditModal = (bill) => {
    setEditingBill(bill._id);
    setEditData({
      type: bill.type,
      amount: bill.amount,
      description: bill.description,
      date: new Date(bill.date).toISOString().split("T")[0]
    });
  };

  // Handle edit input change
  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  // Save updated bill
  const handleUpdate = async (e) => {
    e.preventDefault();

    const { type, amount, date } = editData;

    if (!type || !amount || !date) {
      alert("All fields are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://rms-6one.onrender.com/api/auth/kitchen/bill/${editingBill}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBills(bills.map((b) => (b._id === editingBill ? res.data : b)));
      setEditingBill(null);
      toast.success("Bill updated!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update bill");
    }
  };

  // Delete a bill
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this bill?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://rms-6one.onrender.com/api/auth/kitchen/bill/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBills(bills.filter((bill) => bill._id !== id));
      toast.success("Bill deleted");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      toast.error("Failed to delete bill");
    }
  };

  return (
    <div>
      <h2>All Bills</h2>

      {/* Add Bill Form */}
      <form onSubmit={handleSubmit} className="mb-4 p-3 bg-light border rounded">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Bill Type</label>
            <select
              name="type"
              value={newBill.type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Gas">Gas</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Repairs">Repairs</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={newBill.amount}
              onChange={handleChange}
              step="0.01"
              placeholder="e.g., 150"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              value={newBill.date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-12 mt-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={newBill.description}
              onChange={handleChange}
              rows="2"
              className="form-control"
            ></textarea>
          </div>
          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-success w-100">
              Add Bill
            </button>
          </div>
        </div>
      </form>

      {/* Edit Modal */}
      {editingBill && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Bill</h5>
                <button className="btn-close" onClick={() => setEditingBill(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Bill Type</label>
                    <select
                      name="type"
                      value={editData.type}
                      onChange={handleEditChange}
                      className="form-select"
                    >
                      <option value="Gas">Gas</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Water">Water</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Repairs">Repairs</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount ($)</label>
                    <input
                      type="number"
                      name="amount"
                      value={editData.amount}
                      onChange={handleEditChange}
                      step="0.01"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={editData.date.split("T")[0]}
                      onChange={handleEditChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                      rows="2"
                      className="form-control"
                    ></textarea>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary w-100">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(editingBill)}
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bills List */}
      <div className="mt-4">
        <h4>Recent Bills</h4>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No bills found
                </td>
              </tr>
            )}

            {bills.map((bill) => (
              <tr key={bill._id}>
                <td>{new Date(bill.date).toLocaleDateString()}</td>
                <td>{bill.type}</td>
                <td>${bill.amount.toFixed(2)}</td>
                <td>{bill.description}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => openEditModal(bill)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(bill._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Summary */}
      <div className="mt-4 p-3 bg-white border rounded shadow-sm">
        <h5>Monthly Summary</h5>
        <ul className="list-group">
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>Total Expenses</span>
            <strong>
              $
              {bills.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
            </strong>
          </li>
        </ul>
      </div>

      <ToastContainer />
    </div>
  );
};

export default KitchenBills;