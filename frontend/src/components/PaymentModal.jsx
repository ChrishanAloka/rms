// src/components/PaymentModal.jsx
import React, { useState } from "react";

const PaymentModal = ({ totalAmount, onConfirm, onClose }) => {
  const [payment, setPayment] = useState("");
  const [error, setError] = useState("");

  const handlePaymentChange = (e) => {
    const value = e.target.value;
    setPayment(value);
    setError("");

    // Clear error if valid
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) < totalAmount) {
      return;
    }
  };

  const handleConfirm = () => {
    const paid = parseFloat(payment);

    if (!paid || isNaN(paid)) {
      setError("Please enter a valid payment amount");
      return;
    }

    if (paid < totalAmount) {
      setError(`Insufficient payment. Please pay at least $${totalAmount.toFixed(2)}`);
      return;
    }

    // ✅ Pass payment amount back with order data
    onConfirm(paid); // Call confirm function with actual payment
  };

  const changeDue = payment ? (payment - totalAmount).toFixed(2) : null;

  return (
    <div style={{
      position: "fixed",
      top: "10%",
      left: "20%",
      width: "60%",
      padding: "30px",
      backgroundColor: "white",
      boxShadow: "0 0 10px rgba(0,0,0,0.3)",
      zIndex: "1000"
    }}>
      <h4 className="text-center">Payment</h4>
      <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Enter Payment</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={payment}
          onChange={handlePaymentChange}
          className="form-control"
          placeholder="e.g., 50"
        />
      </div>

      {changeDue !== null && parseFloat(payment) >= totalAmount && (
        <div className="mb-3 alert alert-success">
          <strong>Change Due:</strong> ${changeDue}
        </div>
      )}

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-success" onClick={handleConfirm}>
          Confirm & Place Order
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;