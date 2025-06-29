import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminKitchenRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all kitchen requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://rms-6one.onrender.com/api/auth/kitchen/requests", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
      } catch (err) {
        alert("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://rms-6one.onrender.com/api/auth/kitchen/request/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setRequests(
        requests.map((r) => (r._id === id ? res.data : r))
      );
    } catch (err) {
      alert("Failed to update request status");
    }
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div>
      <h2>Kitchen Supply Requests</h2>

      {/* Request Table */}
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Requested By</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No requests found.
              </td>
            </tr>
          )}
          {requests.map((req, idx) => (
            <tr key={idx}>
              <td>{new Date(req.date).toLocaleDateString()}</td>
              <td>{req.requestedBy?.name || "Unknown"} ({req.requestedBy?.role || ""})</td>
              <td>{req.item}</td>
              <td>{req.quantity}</td>
              <td>
                <span
                  className={`badge ${
                    req.status === "Pending"
                      ? "bg-warning text-dark"
                      : req.status === "Approved"
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                >
                  {req.status}
                </span>
              </td>
              <td>
                {req.status === "Pending" && (
                  <>
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => handleStatusChange(req._id, "Approved")}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleStatusChange(req._id, "Rejected")}
                    >
                      ❌ Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminKitchenRequests;