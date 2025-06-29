import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const AddAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    inTime: "08:00",
    breakStart: "",
    breakEnd: "",
    outTime: "17:00"
  });

  // Load employees on mount
  useEffect(() => {
    fetchEmployees();
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

  // Handle input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle employee select
  const handleEmployeeChange = (selectedOption) => {
    if (!selectedOption) return;

    setSelectedEmp(selectedOption);
  };

  // Submit attendance
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmp) {
      alert("Please select an employee");
      return;
    }

    const payload = {
      ...formData,
      employeeId: selectedEmp.value
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("https://rms-6one.onrender.com/api/auth/attendance/add", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Attendance added successfully!");
      window.location.reload(); // Optional: redirect or reset form
    } catch (err) {
      console.error("Failed to add attendance:", err.message);
      alert("Failed to save attendance");
    }
  };

  // Format options for react-select
  const employeeOptions = employees.map(emp => ({
    value: emp._id,
    label: `${emp.name} (${emp.role})`,
    phone: emp.phone,
    nic: emp.nic
  }));

  return (
    <div>
      <h2>Record Employee Attendance</h2>

      {/* Select Employee */}
      <div className="mb-4">
        <label className="form-label">Select Employee *</label>
        <Select
          options={employeeOptions}
          value={selectedEmp}
          onChange={handleEmployeeChange}
          placeholder="Search or select employee..."
          isClearable
          isSearchable
        />
      </div>

      {/* Attendance Form */}
      {selectedEmp && (
        <form onSubmit={handleSubmit} className="mt-3 p-3 bg-light border rounded">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">In Time</label>
              <input
                type="time"
                name="inTime"
                value={formData.inTime}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Break Start</label>
              <input
                type="time"
                name="breakStart"
                value={formData.breakStart}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Break End</label>
              <input
                type="time"
                name="breakEnd"
                value={formData.breakEnd}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Out Time</label>
              <input
                type="time"
                name="outTime"
                value={formData.outTime}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          {/* Employee Info Preview */}
          <div className="mt-3 p-3 bg-white border rounded shadow-sm">
            <h5>Selected Employee</h5>
            <p><strong>Name:</strong> {selectedEmp.label}</p>
            <p><strong>Phone:</strong> {selectedEmp.phone || "-"}</p>
            <p><strong>NIC:</strong> {selectedEmp.nic || "-"}</p>
          </div>

          {/* Submit Button */}
          <div className="mt-3">
            <button type="submit" className="btn btn-success w-100">
              Save Attendance
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddAttendance;