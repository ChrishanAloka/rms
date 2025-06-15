// src/components/KitchenOrderHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const KitchenOrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    };
    fetchOrders();

    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const completedOrders = orders.filter(
    (order) => order.status === "Ready" || order.status === "Completed"
  );

  return (
    <div>
      <h2>Kitchen - Order History</h2>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {completedOrders.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No completed orders yet.
                </td>
              </tr>
            )}
            {completedOrders.map((order) => (
              <tr key={order._id}>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      order.status === "Ready"
                        ? "bg-success"
                        : "bg-primary"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{order.customerName}</td>
                <td>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KitchenOrderHistory;