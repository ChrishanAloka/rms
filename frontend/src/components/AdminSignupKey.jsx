// src/components/AdminSignupKey.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminSignupKey = () => {
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState("");

  // Load keys
  useEffect(() => {
    const fetchKeys = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/signup-keys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKeys(res.data);
    };
    fetchKeys();
  }, []);

  // Generate new key
  const generateKey = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:5000/api/auth/generate-key",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setKeys([...keys, res.data]);
  };

  // Delete key
  const deleteKey = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/auth/signup-key/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setKeys(keys.filter((key) => key._id !== id));
  };

  return (
    <div>
      <h2>Signup Keys</h2>
      <button className="btn btn-primary mb-3" onClick={generateKey}>
        Generate New Key
      </button>

      <ul className="list-group">
        {keys.map((key) => (
          <li
            key={key._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <code>{key.key}</code>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteKey(key._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSignupKey;