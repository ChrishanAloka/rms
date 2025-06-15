import React, { useEffect, useState } from "react";
import axios from "axios";

const KitchenLanding = () => {
  const [orders, setOrders] = useState([]);

  // Load live orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Mark as ready
  const markAsReady = async (id) => {
  const token = localStorage.getItem("token");

  try {
    await axios.put(
      `http://localhost:5000/api/auth/order/${id}/status`,
      { status: "Ready" },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    // ✅ Remove from live orders
    setOrders(orders.filter((o) => o._id !== id));
  } catch (err) {
    alert("Failed to update order status");
  }
};

  // Filter only Pending + Processing orders
  const liveOrders = orders.filter(
    (order) => order.status === "Pending" || order.status === "Processing"
  );

  return (
    <div>
      <h2>Live Orders</h2>

      <div className="row g-3">
        {liveOrders.length === 0 && (
          <p className="text-muted">No live orders</p>
        )}

        {liveOrders.map((order) => (
          <div key={order._id} className="col-md-6 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Order #{order._id}</h5>
                <p><strong>Customer:</strong> {order.customerName}</p>
                <ul className="list-group list-group-flush mb-3">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{item.name}</span>
                      <span className="badge bg-secondary">{item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="btn btn-success"
                  onClick={() => markAsReady(order._id)}
                >
                  Mark as Ready
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenLanding;