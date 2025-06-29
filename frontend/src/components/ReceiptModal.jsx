import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const exportToPDF = () => {
  const input = document.getElementById("receipt");

  if (!input) {
    alert("Receipt not found");
    return;
  }

  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("receipt.pdf");
  });
};

const ReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  const {
    customerName,
    customerPhone,
    tableNo,
    items,
    totalPrice
  } = order;

  return (
    <div style={{
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "white",
      zIndex: 1000,
      padding: "20px",
      fontFamily: "monospace"
    }}>
      <button onClick={onClose} className="btn btn-secondary mb-3">Close</button>

      <div id="receipt" style={{ maxWidth: "400px", margin: "auto" }}>
        <h3 className="text-center">RMS Restaurant</h3>
        <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Customer:</strong> {customerName}</p>
        <p><strong>Phone:</strong> {customerPhone}</p>
        <p><strong>Table No:</strong> {tableNo || "Takeaway"}</p>

        <hr />

        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {items.map((item, idx) => (
            <li key={idx}>
              {item.name} x{item.quantity} @ ${item.price?.toFixed(2)}
            </li>
          ))}
        </ul>

        <hr />
        <h5 className="text-end">Total: ${totalPrice?.toFixed(2)}</h5>
        <p className="text-center mt-4">Thank you for your order!</p>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => window.print()}
          className="btn btn-success"
        >
          🖨️ Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptModal;