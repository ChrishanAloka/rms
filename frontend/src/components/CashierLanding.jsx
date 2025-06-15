// src/components/CashierLanding.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  // Auto-fill customer name if phone exists
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

  // Handle customer input
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

  // Update quantity in cart
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
    const { phone, name } = customer;
    if (!phone.trim() || !name.trim()) {
      alert("Customer Phone and Name are required.");
      return;
    }

    if (cart.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setOrderData({
      customerName: name,
      customerPhone: phone,
      tableNo: customer.orderType === "takeaway" ? "Takeaway" : customer.tableNo,
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

  // Step 2: After payment, place order
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
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Failed to place order:", err.response?.data || err.message);
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
          <div className="col-md-6">
            <label className="form-label">Customer Phone *</label>
            <input
              type="text"
              name="phone"
              value={customer.phone}
              onChange={handleCustomerChange}
              placeholder="Phone"
              className={`form-control ${
                !customer.phone ? "is-invalid" : ""
              }`}
            />
            {!customer.phone && (
              <div className="invalid-feedback">Enter valid phone number</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label">Customer Name *</label>
            <input
              type="text"
              name="name"
              value={customer.name}
              onChange={handleCustomerChange}
              placeholder="Name"
              className={`form-control ${
                !customer.name ? "is-invalid" : ""
              }`}
            />
            {!customer.name && (
              <div className="invalid-feedback">Enter customer name</div>
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
                  customer.orderType === "table" && !customer.tableNo ? "is-invalid" : ""
                }`}
              />
              {customer.orderType === "table" && !customer.tableNo && (
                <div className="invalid-feedback">Table No is required</div>
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
            disabled={!customer.phone || !customer.name}
            onClick={goToPayment}
          >
            Proceed to Payment
          </button>
        </div>
      )}

      {/* Menu List */}
      <h4>Choose Menu Items</h4>
      <div className="row g-3 mb-4">
        {menus.length === 0 && <p>No menu items available.</p>}

        {menus.map((menu) => {
          const inStock = menu.currentQty > 0;

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
                        menu.currentQty <= menu.minimumQty
                          ? "bg-warning text-dark"
                          : "bg-success"
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