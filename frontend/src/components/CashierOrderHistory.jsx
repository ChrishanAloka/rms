// src/components/CashierOrderHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const CashierOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: ""
  });

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams(filters).toString();

    try {
      const res = await axios.get(`http://localhost:5000/api/auth/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Orders received:", res.data); // 👈 Just to confirm
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

const exportToPDF = () => {
  import("jspdf").then((jsPDF) => {
    import("html2canvas").then((html2canvas) => {
      const input = document.getElementById("order-table");

      if (!input) {
        alert("Could not find order table");
        return;
      }

      setTimeout(() => {
        const input = document.getElementById("order-table");
        if (!input) {
          alert("Table not ready yet");
          return;
        }

        html2canvas.default(input).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF.default("p", "pt", "a4");
          const width = pdf.internal.pageSize.getWidth();
          const height = (canvas.height * width) / canvas.width;

          pdf.addImage(imgData, "PNG", 0, 0, width, height);
          pdf.save("cashier_orders.pdf");
        });

      }, 500); // Small delay to ensure DOM updates
    }).catch(err => console.error("Failed to load html2canvas:", err));
  }).catch(err => console.error("Failed to load jspdf:", err));
};

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2>Order History</h2>

      {/* Filters */}
      <div className="mb-4 d-flex gap-2 flex-wrap align-items-center">
        <input
          name="startDate"
          type="date"
          className="form-control"
          style={{ maxWidth: "160px" }}
          onChange={handleFilterChange}
        />
        <input
          name="endDate"
          type="date"
          className="form-control"
          style={{ maxWidth: "160px" }}
          onChange={handleFilterChange}
        />
        <select
          name="status"
          className="form-select"
          style={{ maxWidth: "200px" }}
          onChange={handleFilterChange}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Ready">Ready</option>
          <option value="Completed">Completed</option>
        </select>
        <button
          className="btn btn-primary"
          onClick={fetchOrders}
        >
          Filter
        </button>
        <button className="btn btn-success me-2" onClick={exportToExcel}>
  Export to Excel
</button>
<button className="btn btn-danger" onClick={exportToPDF}>
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
                    <ul className="list-group list-group-flush">
                      {order.items.map((item, index) => (
                        <li key={index} className="list-group-item p-0">
                          {item.name} x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${order.totalPrice.toFixed(2)}</td>
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