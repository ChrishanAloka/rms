import React, { useEffect, useState } from "react";
import axios from "axios";

const CurrencySettings = () => {
  const [currency, setCurrency] = useState("USD");
  const [symbol, setSymbol] = useState("$");

  // Load current settings
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://rms-6one.onrender.com/api/auth/settings/currency", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCurrency(res.data.currency || "USD");
        setSymbol(res.data.symbol || "$");
      } catch (err) {
        console.error("Failed to load currency:", err.message);
        alert("Failed to load currency. Default $ will be used.");
      }
    };

    fetchCurrency();
  }, []);

  // Save updated currency
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://rms-6one.onrender.com/api/auth/settings/currency",
        { currency, symbol },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // ✅ Show success message
      alert("Currency updated successfully!");

      // ✅ Update currency in localStorage too
      localStorage.setItem("currencySymbol", symbol);
      localStorage.setItem("currencyCode", currency);

    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      alert("Failed to update currency");
    }
  };

  return (
    <div>
      <h2>Currency Settings</h2>

      <div className="mb-3">
        <label className="form-label">Currency Code</label>
        <input
          type="text"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder="e.g., LKR"
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Symbol</label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="e.g., $ or Rs."
          className="form-control"
        />
      </div>

      <button className="btn btn-primary" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
};

export default CurrencySettings;