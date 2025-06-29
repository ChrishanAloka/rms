// src/components/CashierOrderHistory.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Define custom print function
if (!window.printElement) {
  window.printElement = (element) => {
    const originalContents = document.body.innerHTML;
    const printContent = element.outerHTML;

    document.body.innerHTML = `
      <style>
        body { font-family: monospace; max-width: 400px; margin: auto; }
        h3, p, li { display: block; width: 100%; text-align: left; }
      </style>
      ${printContent}
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };
}

const CashierOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: ""
  });

  // Load orders on mount or filter change
  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.status) params.append("status", filters.status);

    try {
      const res = await axios.get(`https://rms-6one.onrender.com/api/auth/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err.response?.data || err.message);
      alert("Failed to load order history");
    }
  };

  const exportToExcel = () => {
    import("xlsx").then((XLSX) => {
      const worksheetData = orders.map((order) => ({
        Date: new Date(order.date).toLocaleString(),
        Customer: order.customerName,
        Table: order.tableNo,
        Status: order.status,
        Total: order.totalPrice?.toFixed(2)
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, "cashier_orders.xlsx");
    });
  };

    // Get currency from localStorage (not from React context)
  const symbol = localStorage.getItem("currencySymbol") || "$";

  const exportToPDF = () => {
    const input = document.getElementById("order-table");

    if (!input) {
      alert("Could not find order table");
      return;
    }

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("cashier_orders.pdf");
    });
  };

  const generateReceipt = (order) => {
  const receiptDiv = document.createElement("div");
  receiptDiv.id = `receipt-${order._id}`;
  receiptDiv.style.maxWidth = "400px";
  receiptDiv.style.margin = "auto";
  receiptDiv.style.padding = "20px";
  receiptDiv.style.fontFamily = "monospace";



  receiptDiv.innerHTML = `
    <h3 class="text-center">RMS Restaurant</h3>
    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
    <p><strong>Customer:</strong> ${order.customerName}</p>
    <p><strong>Phone:</strong> ${order.customerPhone || "-"}</p>
    <p><strong>Table No:</strong> ${order.tableNo || "Takeaway"}</p>
    <hr />
    <ul style="list-style: none; padding-left: 0;">
      ${order.items.map(item => `
        <li>${item.name} x${item.quantity} @ ${symbol}${item.price?.toFixed(2)}</li>
      `).join("")}
    </ul>
    <hr />
    <h5 class="text-end">Total: ${symbol}${order.totalPrice?.toFixed(2)}</h5>
    <p class="text-center mt-4">Thank you for your visit!</p>
  `;

  document.body.appendChild(receiptDiv);
  window.printElement(receiptDiv);
};

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Order History</h2>

      {/* Filters */}
      <div className="mb-4 d-flex flex-wrap gap-2 align-items-center">
        <div>
          <label className="form-label">Start Date</label>
          <input
            name="startDate"
            type="date"
            className="form-control"
            onChange={handleFilterChange}
          />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input
            name="endDate"
            type="date"
            className="form-control"
            onChange={handleFilterChange}
          />
        </div>
        <div>
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button className="btn btn-primary mt-4" onClick={fetchOrders}>
          Apply Filters
        </button>
        <button className="btn btn-success mt-4" onClick={exportToExcel}>
          Export to Excel
        </button>
        <button className="btn btn-danger mt-4" onClick={exportToPDF}>
          Export to PDF
        </button>
      </div>

      {/* Order List */}
      {orders.length === 0 ? (
        <p className="text-muted">No orders found.</p>
      ) : (
        <div id="order-table" className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Table</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{new Date(order.date).toLocaleString()}</td>
                  <td>{order.customerName}</td>
                  <td>{order.tableNo}</td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "Ready"
                          ? "bg-success"
                          : order.status === "Processing"
                          ? "bg-primary text-white"
                          : order.status === "Completed"
                          ? "bg-secondary"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <ul className="list-group list-group-flush small">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="list-group-item p-0">
                          {item.name} x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{symbol}{order.totalPrice?.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => generateReceipt(order)}
                    >
                      🖨️ Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CashierOrderHistory;