// backend/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  imageUrl: String
});

const orderSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  customerName: String,
  customerPhone: String,
  tableNo: String,
  items: [orderItemSchema],
  totalPrice: Number,
  paymentAmount: Number,
  changeDue: Number,
  status: {
    type: String,
    enum: ["Pending", "Processing", "Ready", "Completed"],
    default: "Pending"
  },
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Order", orderSchema);