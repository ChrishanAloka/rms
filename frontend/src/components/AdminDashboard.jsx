import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// ✅ Register chart components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSalaries: 0,
    totalBills: 0,
    totalCost: 0,
    netProfit: 0
  });

  // ✅ Helper function to format currency safely
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Load summary data
  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("https://rms-6one.onrender.com/api/auth/admin/summary", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Raw Summary Data:", res.data); // ✅ Log it here
    setSummary(res.data);
  } catch (err) {
    console.error("Failed to load dashboard summary:", err.message);
    alert("Failed to load admin summary");
  }
};

  // ✅ Cost breakdown chart
  const costData = {
    labels: ["Salary", "Expenses", "Bills"],
    datasets: [
      {
        label: "Cost Breakdown",
        data: [summary.totalSalaries, summary.totalExpenses, summary.totalBills],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
      }
    ]
  };

  const symbol = localStorage.getItem("currencySymbol") || "$";

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {/* Total Income */}
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5>Total Income</h5>
              <h3>{symbol}{formatCurrency(summary.totalIncome)}</h3>
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5>Total Cost</h5>
              <h3>{symbol}{formatCurrency(summary.totalCost)}</h3>
            </div>
          </div>
        </div>

        {/* Net Profit/Loss */}
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5>Net Profit / Loss</h5>
              <h3 style={{ color: summary.netProfit >= 0 ? "white" : "yellow" }}>
                {symbol}{formatCurrency(summary.netProfit)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>Breakdown of Costs</h5>
              <Doughnut data={costData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;