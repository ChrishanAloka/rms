import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Select from "react-select";

const AttendanceDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // Load employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://rms-6one.onrender.com/api/auth/employees", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to load employees:", err.message);
        alert("Failed to load employees");
      }
    };
    fetchEmployees();
  }, []);

  // Fetch attendance by employee ID and filter
  const fetchAttendance = async (id, month = filters.month, year = filters.year) => {
    if (!id) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://rms-6one.onrender.com/api/auth/attendance/by-employee?id=${id}&month=${month}&year=${year}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAttendances(res.data);
    } catch (err) {
      console.error("Failed to load attendance:", err.message);
      alert("Failed to load attendance data");
    }
  };

  // Handle employee change
  const handleEmployeeChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedEmp(null);
      setAttendances([]);
      return;
    }

    setSelectedEmp(selectedOption);
    fetchAttendance(selectedOption.value);
  };

  // Handle month/year change
  const handleMonthYearChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setFilters({ month, year });
    if (selectedEmp) {
      fetchAttendance(selectedEmp.value, month, year);
    }
  };

  // Format options for react-select
  const employeeOptions = employees.map(emp => ({
    value: emp._id,
    label: `${emp.name} (${emp.role})`,
    ...emp
  }));

  // Export to Excel
  const exportToExcel = () => {
    import("xlsx").then(XLSX => {
      const worksheetData = attendances.map(a => ({
        Date: new Date(a.date).toLocaleDateString(),
        "In Time": a.inTime,
        "Break Start": a.breakStart || "-",
        "Break End": a.breakEnd || "-",
        "Out Time": a.outTime,
        "Total Hours": a.totalHours?.toFixed(2)
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");
      XLSX.writeFile(wb, `attendance_${new Date().toISOString().slice(0, 7)}.xlsx`);
    });
  };

  // Export to PDF
  const exportToPDF = () => {
    import("jspdf").then(jsPDF => {
      import("html2canvas").then(html2canvas => {
        const input = document.getElementById("attendance-table");

        html2canvas.default(input).then(canvas => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF.default("p", "pt", "a4");
          const width = pdf.internal.pageSize.getWidth();
          const height = (canvas.height * width) / canvas.width;

          pdf.addImage(imgData, "PNG", 0, 0, width, height);
          pdf.save(`attendance_${new Date().toISOString().slice(0, 7)}.pdf`);
        });
      }).catch(err => console.error("Failed to load html2canvas:", err));
    }).catch(err => console.error("Failed to load jspdf:", err));
  };

  return (
    <div>
      <h2>Employee Attendance</h2>

      {/* Add New Button */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <Link to="/admin/attendance/add" className="btn btn-primary">
          + Add New
        </Link>
      </div>

      {/* Searchable Employee Dropdown */}
      <div className="mb-4">
        <label className="form-label">Select Employee</label>
        <Select
          options={employeeOptions}
          value={selectedEmp}
          onChange={handleEmployeeChange}
          placeholder="Search or select employee..."
          isClearable
          isSearchable
        />
      </div>

      {/* Month Filter */}
      {selectedEmp && (
        <div className="mb-4">
          <label className="form-label">Filter by Month</label>
          <input
            type="month"
            className="form-control"
            defaultValue={`${filters.year}-${String(filters.month).padStart(2, "0")}`}
            onChange={handleMonthYearChange}
          />
        </div>
      )}

      {/* Attendance Table */}
      {selectedEmp && attendances.length > 0 ? (
        <div id="attendance-table">
          <h5>Detailed Attendance</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>In Time</th>
                <th>Break Start</th>
                <th>Break End</th>
                <th>Out Time</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((a, idx) => (
                <tr key={idx}>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.inTime}</td>
                  <td>{a.breakStart || "-"}</td>
                  <td>{a.breakEnd || "-"}</td>
                  <td>{a.outTime}</td>
                  <td>{a.totalHours?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        selectedEmp && <p>No attendance found for this month.</p>
      )}

      {/* Export Buttons */}
      {selectedEmp && attendances.length > 0 && (
        <div className="mt-3">
          <button className="btn btn-success me-2" onClick={exportToExcel}>
            Export to Excel
          </button>
          <button className="btn btn-danger" onClick={exportToPDF}>
            Export to PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;