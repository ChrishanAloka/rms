import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const SupplierRegistration = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    email: "",
    address: ""
  });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editData, setEditData] = useState({ ...newSupplier });

  // Load suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://rms-6one.onrender.com/api/auth/suppliers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data);
    } catch (err) {
      alert("Failed to load suppliers");
    }
  };

  const handleChange = (e) =>
    setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://rms-6one.onrender.com/api/auth/supplier/register",
        newSupplier,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuppliers([...suppliers, res.data]);
      setNewSupplier({ name: "", contact: "", email: "", address: "" });
      alert("Supplier registered successfully!");
    } catch (err) {
      console.error("Register failed:", err.response?.data || err.message);
      alert("Failed to register supplier");
    }
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier._id);
    setEditData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      address: supplier.address
    });
  };

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://rms-6one.onrender.com/api/auth/supplier/${editingSupplier}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuppliers(suppliers.map((s) => (s._id === editingSupplier ? res.data : s)));
      setEditingSupplier(null);
      toast.success("Supplier updated successfully!");
    } catch (err) {
      alert("Failed to update supplier");
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    axios
      .delete(`https://rms-6one.onrender.com/api/auth/supplier/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(() => {
        setSuppliers(suppliers.filter((s) => s._id !== id));
        toast.success("Supplier deleted");
      })
      .catch((err) => {
        toast.error("Failed to delete supplier");
      });
  };

  return (
    <div>
      <h2>Register New Supplier</h2>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="mb-4 p-3 bg-light border rounded">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={newSupplier.name}
              onChange={handleChange}
              placeholder="Enter supplier name"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Contact Info *</label>
            <input
              type="text"
              name="contact"
              value={newSupplier.contact}
              onChange={handleChange}
              placeholder="Phone / Email"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={newSupplier.email}
              onChange={handleChange}
              placeholder="supplier@example.com"
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              value={newSupplier.address}
              onChange={handleChange}
              placeholder="Enter address"
              className="form-control"
            />
          </div>
          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-success w-100">
              Register Supplier
            </button>
          </div>
        </div>
      </form>

      {/* Edit Modal */}
      {editingSupplier && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Supplier</h5>
                <button className="btn-close" onClick={() => setEditingSupplier(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact</label>
                    <input
                      type="text"
                      name="contact"
                      value={editData.contact}
                      onChange={handleEditChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editData.address}
                      onChange={handleEditChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mt-3 d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingSupplier(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suppliers List */}
      <h4>Registered Suppliers</h4>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No suppliers found
              </td>
            </tr>
          )}
          {suppliers.map((s, idx) => (
            <tr key={idx}>
              <td>{s.name}</td>
              <td>{s.contact}</td>
              <td>{s.email || "-"}</td>
              <td>{s.address || "-"}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => openEditModal(s)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(s._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierRegistration;