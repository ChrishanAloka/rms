// src/components/MonthlyReport.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  // Load report data based on selected month/year
  useEffect(() => {
    const fetchReport = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `https://rms-6one.onrender.com/api/auth/report/monthly?month=${parseInt(month)}&year=${parseInt(year)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setReportData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load report:", err.message);
        alert("Failed to load monthly report");
        setLoading(false);
      }
    };

    fetchReport();
  }, [month, year]);

  if (loading) return <div>Loading report...</div>;
  if (!reportData || !reportData.monthlyIncome || !reportData.monthlyExpenses)
    return <div>No data found</div>;

  // Generate chart labels and data
  const getDatesInMonth = (year, month) => {
    const numDays = new Date(year, month + 1, 0).getDate(); // Get total days
    const dates = [];

    for (let i = 1; i <= numDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      dates.push(dateStr);
    }

    return dates;
  };

  const allDates = getDatesInMonth(year, month); // ✅ All dates in selected month

  const incomeData = allDates.map(date => reportData.monthlyIncome[date] || 0);
  const expenseData = allDates.map(date => reportData.monthlyExpenses[date] || 0);

  const chartData = {
    labels: allDates.map(date => date.split("-")[2]), // Only show day of the month
    datasets: [
      {
        label: "Income ($)",
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
        data: incomeData
      },
      {
        label: "Expenses ($)",
        backgroundColor: "rgba(255,99,132,0.6)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        data: expenseData
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Monthly Report - ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}`
      }
    }
  };

  // Calculate totals
  const totalIncome = incomeData.reduce((a, b) => a + b, 0);
  const totalExpenses = expenseData.reduce((a, b) => a + b, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div>
      <h2>Monthly Income vs. Expenses</h2>

      {/* Month/Year Picker */}
      <div className="mb-4 d-flex gap-3 align-items-end">
        <div>
          <label className="form-label">Select Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="form-select"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i}>
                {new Date(year, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Select Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="form-control"
            min="2020"
            max="2030"
          />
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", maxWidth: "900px", margin: "auto" }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Summary Stats */}
      <div className="mt-4 p-3 bg-white border rounded shadow-sm">
        <h5>Summary for {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h5>
        <p><strong>Total Income:</strong> ${totalIncome.toFixed(2)}</p>
        <p><strong>Total Expenses:</strong> ${totalExpenses.toFixed(2)}</p>
        <p><strong>Net Profit:</strong> ${netProfit.toFixed(2)}</p>
      </div>

      {/* Daily Breakdown Table */}
      <div className="mt-4">
        <h4>Daily Breakdown</h4>
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Date</th>
              <th>Income ($)</th>
              <th>Expense ($)</th>
              <th>Net ($)</th>
            </tr>
          </thead>
          <tbody>
            {allDates.map((date, idx) => (
              <tr key={idx}>
                <td>{date}</td>
                <td>${incomeData[idx].toFixed(2)}</td>
                <td>${expenseData[idx].toFixed(2)}</td>
                <td>${(incomeData[idx] - expenseData[idx]).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyReport;