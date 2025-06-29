// src/components/CashierDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";


const CashierDashboard = () => {
  const [orders, setOrders] = useState([]);

      // Get currency from localStorage (not from React context)
  const symbol = localStorage.getItem("currencySymbol") || "$";

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
      <h2>Today's Orders</h2>

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
              Total: {symbol}{order.totalPrice?.toFixed(2)}
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