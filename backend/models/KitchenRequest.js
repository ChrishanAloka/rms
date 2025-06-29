const mongoose = require("mongoose");

const kitchenRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  item: { type: String, required: true },         // Name of supply
  quantity: { type: Number, required: true },     // Quantity needed
  reason: { type: String },                     // Why it's needed
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }
});

module.exports = mongoose.model("KitchenRequest", kitchenRequestSchema);