import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://rms-6one.onrender.com/api/auth/employees", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load employees:", err.message);
        alert("Failed to load employees");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Export to Excel
  const exportToExcel = () => {
    import("xlsx").then((XLSX) => {
      const worksheetData = employees.map((emp) => ({
        ID: emp.id,
        Name: emp.name,
        NIC: emp.nic,
        Phone: emp.phone,
        Role: emp.role,
        "Basic Salary": emp.basicSalary,
        "Working Hours": emp.workingHours,
        "OT Rate": emp.otHourRate || "N/A",
        "Bank Account": emp.bankAccountNo || "N/A"
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Employees");
      XLSX.writeFile(wb, "rms_employees.xlsx");
    });
  };

  // Export to PDF
  const exportToPDF = () => {
    const input = document.getElementById("employee-table");

    if (!input) {
      alert("Could not find table to export.");
      return;
    }

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("rms_employees.pdf");
    });
  };

  const handleDelete = (id) => {
  if (!window.confirm("Are you sure you want to delete this employee?")) return;

  axios
    .delete(`https://rms-6one.onrender.com/api/auth/employee/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(() => {
      setEmployees(employees.filter((emp) => emp._id !== id));
      toast.success("Employee deleted successfully");
    })
    .catch((err) => {
      toast.error("Failed to delete employee");
      console.error("Delete failed:", err.message);
    });
};

  return (
    <div>
      <h2>Manage Employees</h2>

      {/* Actions */}
      <div className="mb-3 d-flex justify-content-between">
        <Link to="/admin/employee/new" className="btn btn-success">
          + Add New Employee
        </Link>
        <div>
          <button className="btn btn-primary me-2" onClick={exportToExcel}>
            Export to Excel
          </button>
          <button className="btn btn-danger" onClick={exportToPDF}>
            Export to PDF
          </button>
        </div>
      </div>

      {/* Employee Table */}
      {loading && <p>Loading employees...</p>}
      {!loading && employees.length === 0 && (
        <p className="text-muted">No employees found.</p>
      )}

      <div id="employee-table">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>NIC</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Basic Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr key={idx}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.nic}</td>
                <td>{emp.phone}</td>
                <td>{emp.role}</td>
                <td>${emp.basicSalary.toFixed(2)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary">
                      <Link to={`/admin/employee/edit/${emp._id}`}>
                        Edit
                      </Link>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(emp._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEmployees;