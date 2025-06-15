// src/components/CashierDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const CashierDashboard = () => {
  const [orders, setOrders] = useState([]);

  // Load today's orders
  useEffect(() => {
    const fetchTodayOrders = async () => {
      const token = localStorage.getItem("token");
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const res = await axios.get("https://rms-6one.onrender.com/api/auth/orders", {
        params: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString()
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(res.data);
    };

    fetchTodayOrders();

    const interval = setInterval(fetchTodayOrders, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Cashier Dashboard</h2>

      <h4>Today's Orders</h4>
      {orders.length === 0 ? (
        <p className="text-muted">No orders today</p>
      ) : (
        <ul className="list-group">
          {orders.map((order) => (
            <li key={order._id} className="list-group-item">
              <strong>Order #{order._id}</strong>
              <br />
              Customer: {order.customerName}
              <br />
              Total: ${order.totalPrice?.toFixed(2)}
              <br />
              Status:{" "}
              <span
                className={`badge ${
                  order.status === "Ready"
                    ? "bg-success"
                    : "bg-primary"
                }`}
              >
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CashierDashboard;