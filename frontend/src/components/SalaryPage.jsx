import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SalaryPage = () => {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [formData, setFormData] = useState({
    employee: null,
    basicSalary: "",
    otHours: 0,
    otRate: 0
  });

  // Load employees and salaries on mount
  useEffect(() => {
    fetchEmployees();
    fetchSalaries();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://rms-6one.onrender.com/api/auth/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      alert("Failed to load employees");
    }
  };

  const fetchSalaries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://rms-6one.onrender.com/api/auth/salaries", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalaries(res.data);
    } catch (err) {
      console.error("Failed to load salaries:", err.message);
    }
  };

  const handleEmployeeChange = (selectedOption) => {
    if (!selectedOption) return;

    setFormData({
      ...formData,
      employee: selectedOption,
      basicSalary: selectedOption.basicSalary || 0,
      otHours: 0,
      otRate: selectedOption.otHourRate || 0
    });
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.employee || !formData.basicSalary) {
    alert("Please select employee and enter basic salary.");
    return;
  }

  const payload = {
    employee: formData.employee.value,
    basicSalary: parseFloat(formData.basicSalary),
    otHours: parseInt(formData.otHours),
    otRate: parseFloat(formData.otRate)
  };

  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "https://rms-6one.onrender.com/api/auth/salary/add",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    // ✅ Only show success if response is valid
    if (res.data && res.data._id) {
      const employeeData = employees.find(e => e._id === res.data.employee);

      setSalaries([{
        ...res.data,
        employee: employeeData
      }, ...salaries]);

      setFormData({
        employee: null,
        basicSalary: "",
        otHours: 0,
        otRate: 0
      });

      toast.success("Salary recorded successfully!");
    } else {
      toast.error("Server returned no data");
    }
  } catch (err) {
    console.error("Failed to record salary:", err.response?.data || err.message);
    toast.error("Failed to record salary");
  }
};

  // Format options for react-select
  const employeeOptions = employees.map(emp => ({
    value: emp._id,
    label: `${emp.name} (${emp.role})`,
    basicSalary: emp.basicSalary,
    otHourRate: emp.otHourRate
  }));

  return (
    <div>
      <h2>Record Employee Salary</h2>
      <ToastContainer />

      {/* Salary Form */}
      <form onSubmit={handleSubmit} className="mb-4 p-3 bg-light border rounded">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Select Employee *</label>
            <Select
              options={employeeOptions}
              onChange={handleEmployeeChange}
              value={formData.employee}
              placeholder="Search or select..."
              isClearable
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
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">OT Hours</label>
            <input
              type="number"
              name="otHours"
              value={formData.otHours}
              onChange={handleChange}
              min="0"
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">OT Rate ($)</label>
            <input
              type="number"
              name="otRate"
              value={formData.otRate}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="form-control"
            />
          </div>
          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-success w-100">
              Record Salary
            </button>
          </div>
        </div>
      </form>

      {/* Salary Records */}
      <h4>Salary Records</h4>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Basic</th>
            <th>OT Hours</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {salaries.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No records found
              </td>
            </tr>
          )}
          {salaries.map((s, idx) => (
            <tr key={idx}>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>
                {s.employee?.name || "Unknown"} ({s.employee?.role || ""})
              </td>
              <td>${s.basicSalary?.toFixed(2)}</td>
              <td>{s.otHours}</td>
              <td>${s.total?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalaryPage;