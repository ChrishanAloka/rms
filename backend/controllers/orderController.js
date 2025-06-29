// backend/controllers/orderController.js

const mongoose = require("mongoose");
const Order = require("../models/Order");
const Menu = require("../models/Menu");

exports.createOrder = async (req, res) => {
  const { customerPhone, customerName, tableNo, items } = req.body;

  // Check if customer already exists
  const existingCustomer = await Order.findOne({ customerPhone }).sort({ date: -1 });
  const finalCustomerName = existingCustomer?.customerName || customerName;

  let totalPrice = 0;
  let validItems = [];

  // Validate and enrich each item
  for (let item of items) {
    const menuItem = await Menu.findById(item.menuId);
    if (!menuItem) {
      return res.status(400).json({ error: "Invalid menu item" });
    }

    if (item.quantity > menuItem.currentQty) {
      return res.status(400).json({
        error: `Only ${menuItem.currentQty} left in stock for ${menuItem.name}`
      });
    }

    totalPrice += menuItem.price * item.quantity;

    validItems.push({
      menuId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      imageUrl: menuItem.imageUrl,
      quantity: item.quantity
    });
  }

  try {
    const newOrder = new Order({
      customerName: finalCustomerName,
      customerPhone,
      tableNo,
      items: validItems,
      totalPrice,
      cashierId: req.user.id
    });

    await newOrder.save();

    // Update menu quantities
    for (let item of validItems) {
      await Menu.findByIdAndUpdate(item.menuId, {
        $inc: { currentQty: -item.quantity }
      });
    }

    res.json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order history for cashier
exports.getOrderHistory = async (req, res) => {
  const { startDate, endDate, status } = req.query;
  const query = {};

  // Handle date range
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  // ✅ Handle status filter
  if (status) {
    query.status = status;
  }

  try {
    const orders = await Order.find(query).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Failed to load orders:", err.message);
    res.status(500).json({ error: "Failed to load orders" });
  }
};

// Update order status (used by both admin & kitchen)
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update status" });
  }
};

exports.exportOrdersToExcel = async (req, res) => {
  const orders = await Order.find({});
  const XLSX = require("xlsx");

  const flatOrders = orders.flatMap(order =>
    order.items.map(i => ({
      OrderID: order._id,
      Date: new Date(order.date).toLocaleString(),
      Customer: order.customerName,
      Table: order.tableNo,
      Item: i.name,
      Quantity: i.quantity,
      Price: i.price,
      TotalPrice: i.price * i.quantity,
      Status: order.status
    }))
  );

  const ws = XLSX.utils.json_to_sheet(flatOrders);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  XLSX.writeFile(wb, "cashier_orders.xlsx");
  res.json({ message: "Exported" });
};

// backend/controllers/orderController.js

exports.getCustomerByPhone = async (req, res) => {
  const { phone } = req.query;

  if (!phone) return res.json(null);

  try {
    const lastOrder = await Order.findOne({ customerPhone: phone }).sort({ date: -1 });

    if (lastOrder) {
      return res.json({
        name: lastOrder.customerName,
        phone: lastOrder.customerPhone
      });
    }

    res.json(null);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

// backend/controllers/orderController.js

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update status" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to load order" });
  }
};