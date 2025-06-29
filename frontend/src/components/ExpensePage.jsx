import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExpensePage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    supplier: null,
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    fetchSuppliers();
    fetchExpenses();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://rms-6one.onrender.com/api/auth/suppliers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data);
    } catch (err) {
      alert("Failed to load suppliers");
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://rms-6one.onrender.com/api/auth/expenses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data);
    } catch (err) {
      alert("Failed to load expenses");
    }
  };

  const handleSupplierChange = (selectedOption) => {
    if (!selectedOption) return;

    setFormData({
      ...formData,
      supplier: selectedOption
    });
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.supplier || !formData.amount) {
    alert("Please select supplier and enter amount");
    return;
  }

  const payload = {
    supplier: formData.supplier.value,
    amount: parseFloat(formData.amount),
    description: formData.description,
    date: formData.date
  };

  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "https://rms-6one.onrender.com/api/auth/expense/add",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (res.data && res.data._id) {
      const supplierData = suppliers.find(s => s._id === payload.supplier);

      setExpenses([{
        ...res.data,
        supplier: supplierData
      }, ...expenses]);

      setFormData({
        supplier: null,
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });

      toast.success("Expense added successfully!");
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error("Add expense failed:", err.response?.data || err.message);
    toast.error("Failed to add expense");
  }
};

  // Format options for react-select
  const supplierOptions = suppliers.map((s) => ({
    value: s._id,
    label: `${s.name} (${s.contact})`
  }));

  return (
    <div>
      <h2>Record Supplier Expense</h2>
      <ToastContainer />

      {/* Expense Form */}
      <form onSubmit={handleSubmit} className="mb-4 p-3 bg-light border rounded">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Select Supplier *</label>
            <Select
              options={supplierOptions}
              value={formData.supplier}
              onChange={handleSupplierChange}
              placeholder="Search supplier..."
              isClearable
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="e.g., 100"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Raw materials"
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-success w-100">
              Save Expense
            </button>
          </div>
        </div>
      </form>

      {/* Expense List */}
      <h4>Recent Expenses</h4>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Supplier</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No expenses found
              </td>
            </tr>
          )}
          {expenses.map((exp, idx) => (
            <tr key={idx}>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              <td>{exp.supplier?.name || "Unknown"}</td>
              <td>{exp.description || "-"}</td>
              <td>${exp.amount?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensePage;