import React, { useState, useEffect } from "react";
import axios from "axios";

const KitchenRequestForm = () => {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    reason: ""
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user's own requests
  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://rms-6one.onrender.com/api/auth/kitchen/my-requests",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setRequests(res.data);
      } catch (err) {
        console.error("Failed to load your requests:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://rms-6one.onrender.com/api/auth/kitchen/request",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setRequests([res.data, ...requests]);
      setFormData({ item: "", quantity: "", reason: "" });
      alert("Request submitted successfully!");
    } catch (err) {
      alert("Failed to submit request");
    }
  };

  return (
    <div>
      <h2>Request Kitchen Supplies</h2>

      {/* Submit New Request */}
      <form onSubmit={handleSubmit} className="mt-3 mb-4 p-3 bg-light border rounded">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Item *</label>
            <input
              type="text"
              name="item"
              value={formData.item}
              onChange={handleChange}
              placeholder="e.g., Spices, Oil"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              placeholder="e.g., 5 kg"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-12">
            <label className="form-label">Reason (Optional)</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="2"
              className="form-control"
              placeholder="Why do you need this?"
            ></textarea>
          </div>
          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-success w-100">
              Submit Request
            </button>
          </div>
        </div>
      </form>

      {/* Past Requests Table */}
      <h4>Your Recent Requests</h4>
      {loading && <p>Loading...</p>}
      {!loading && requests.length === 0 && (
        <p className="text-muted">No requests found.</p>
      )}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Admin Comment</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, idx) => (
            <tr key={idx}>
              <td>{new Date(req.date).toLocaleDateString()}</td>
              <td>{req.item}</td>
              <td>{req.quantity}</td>
              <td>
                <span
                  className={`badge ${
                    req.status === "Approved"
                      ? "bg-success"
                      : req.status === "Rejected"
                      ? "bg-danger text-white"
                      : "bg-warning text-dark"
                  }`}
                >
                  {req.status}
                </span>
              </td>
              <td>{req.adminComment || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KitchenRequestForm;