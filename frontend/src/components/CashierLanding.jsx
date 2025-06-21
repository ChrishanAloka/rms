// src/components/CashierLanding.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import ReceiptModal from "./ReceiptModal";
import PaymentModal from "./PaymentModal";

const CashierLanding = () => {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    phone: "",
    name: "",
    orderType: "table",
    tableNo: ""
  });
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false); // Controls error visibility

  // Load menus on mount
  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/menus", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenus(res.data);
    } catch (err) {
      console.error("Failed to load menus:", err.message);
    }
  };

  // Auto-fill customer name by phone
  useEffect(() => {
    if (!customer.phone) return;

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/auth/customer", {
          params: { phone: customer.phone },
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data?.name && !customer.name) {
          setCustomer((prev) => ({ ...prev, name: res.data.name }));
        }
      } catch (err) {
        console.error("Auto-fill failed:", err.message);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [customer.phone]);

  // Handle customer input change
  const handleCustomerChange = (e) =>
    setCustomer({ ...customer, [e.target.name]: e.target.value });

  // Add to cart
  const addToCart = (menu) => {
    if (!menu._id || menu.currentQty <= 0) return;
    const existingItem = cart.find((item) => item._id === menu._id);
    if (!existingItem) {
      setCart([...cart, { ...menu, quantity: 1 }]);
    } else {
      setCart(
        cart.map((item) =>
          item._id === menu._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    }
  };

  // Remove from cart
  const removeFromCart = (menuId) => {
    setCart(cart.filter((item) => item._id !== menuId));
  };

  // Update quantity
  const updateQuantity = (menuId, delta) => {
    setCart(
      cart.map((item) =>
        item._id === menuId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // Step 1: Validate and go to payment
  const goToPayment = () => {
    setFormSubmitted(true); // Show validation now

    const { phone, name, orderType, tableNo } = customer;

    if (!phone.trim() || !name.trim()) {
      toast.error("Phone and Name are required.");
      return;
    }

    if (orderType === "table" && !tableNo.trim()) {
      toast.error("Table No is required for dine-in orders");
      return;
    }

    if (cart.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setOrderData({
      customerName: name,
      customerPhone: phone,
      tableNo: orderType === "takeaway" ? "Takeaway" : tableNo,
      items: cart.map((item) => ({
        menuId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      })),
      totalPrice: total
    });

    setShowPaymentModal(true);
  };

  // Step 2: Confirm order and send to backend
  const submitConfirmedOrder = async (paymentAmount) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...customer,
        ...orderData,
        paymentAmount,
        changeDue: (paymentAmount - orderData.totalPrice).toFixed(2)
      };

      const res = await axios.post("http://localhost:5000/api/auth/order", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setReceiptOrder(res.data);
      setCustomer({
        phone: "",
        name: "",
        orderType: "table",
        tableNo: ""
      });
      setCart([]);
      fetchMenus();
      setShowPaymentModal(false);
      setFormSubmitted(false); // Reset form validation
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Order failed:", err.response?.data || err.message);
      alert("Failed to place order");
    }
  };

  return (
    <div>
      <h2>Cashier Dashboard</h2>

      {/* Customer Info */}
      <div className="mb-4 p-3 bg-light border rounded">
        <h5>Customer Details</h5>
        <div className="row g-3">
          {/* Phone */}
          <div className="col-md-6">
            <label className="form-label">Customer Phone *</label>
            <input
              type="text"
              name="phone"
              value={customer.phone}
              onChange={handleCustomerChange}
              placeholder="Phone"
              className={`form-control ${
                formSubmitted && !customer.phone.trim()
                  ? "is-invalid"
                  : ""
              }`}
            />
            {formSubmitted && !customer.phone.trim() && (
              <div className="invalid-feedback">
                Please enter a valid phone number
              </div>
            )}
          </div>

          {/* Name */}
          <div className="col-md-6">
            <label className="form-label">Customer Name *</label>
            <input
              type="text"
              name="name"
              value={customer.name}
              onChange={handleCustomerChange}
              placeholder="Name"
              className={`form-control ${
                formSubmitted && !customer.name.trim()
                  ? "is-invalid"
                  : ""
              }`}
            />
            {formSubmitted && !customer.name.trim() && (
              <div className="invalid-feedback">
                Please enter customer name
              </div>
            )}
          </div>
        </div>

        {/* Order Type */}
        <div className="mt-3">
          <label className="form-label">Order Type</label>
          <select
            name="orderType"
            value={customer.orderType}
            onChange={handleCustomerChange}
            className="form-select mb-2"
          >
            <option value="table">Dine In</option>
            <option value="takeaway">Takeaway</option>
          </select>

          {customer.orderType === "table" && (
            <>
              <label className="form-label mt-2">Table No *</label>
              <input
                name="tableNo"
                value={customer.tableNo}
                onChange={handleCustomerChange}
                placeholder="Table No"
                className={`form-control ${
                  formSubmitted &&
                  customer.orderType === "table" &&
                  !customer.tableNo.trim()
                    ? "is-invalid"
                    : ""
                }`}
              />
              {formSubmitted &&
                customer.orderType === "table" &&
                !customer.tableNo.trim() && (
                  <div className="invalid-feedback">
                    Table No is required for dine-in orders
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Order Summary */}
      {cart.length > 0 && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h4>Order Summary</h4>
          <ul className="list-group mb-3">
            {cart.map((item) => (
              <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{item.name}</span>
                <div className="d-flex align-items-center">
                  <div className="btn-group btn-group-sm me-2">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item._id, -1)}
                    >
                      -
                    </button>
                    <button className="btn btn-light disabled">
                      {item.quantity}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item._id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <h5>Total: $
            {cart
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toFixed(2)}
          </h5>
          <button
            className="btn btn-success w-100 mt-2"
            onClick={goToPayment}
          >
            Proceed to Payment
          </button>
        </div>
      )}

      {/* Menu List */}
      <h4>Choose Menu Items</h4>
      <div className="row g-3 mb-4">
        {menus.length === 0 && (
          <p className="text-muted">No menu items available.</p>
        )}
        {menus.map((menu) => {
          const inStock = menu.currentQty > 0;
          const lowStock = menu.currentQty <= menu.minimumQty;

          return (
            <div key={menu._id} className="col-md-3 mb-3">
              <div className="card shadow-sm h-100 position-relative">
                <img
                  src={`http://localhost:5000${menu.imageUrl}`}
                  alt={menu.name}
                  style={{ height: "280px", objectFit: "cover" }}
                  className="card-img-top"
                />
                <div className="card-body d-flex flex-column">
                  <h5>{menu.name}</h5>
                  <p>
                    Price: ${menu.price.toFixed(2)}<br />
                    Stock:{" "}
                    <span
                      className={`badge ${
                        lowStock ? "bg-warning text-dark" : "bg-success"
                      }`}
                    >
                      {menu.currentQty}
                    </span>{" "}
                    left
                  </p>
                  {inStock && (
                    <button
                      className="btn btn-primary mt-auto"
                      onClick={() => addToCart(menu)}
                    >
                      Add to Order
                    </button>
                  )}
                  {!inStock && (
                    <div className="mt-auto pt-2 text-danger">
                      <strong>Out of Stock</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          totalAmount={orderData?.totalPrice || 0}
          onConfirm={submitConfirmedOrder}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Receipt Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default CashierLanding;