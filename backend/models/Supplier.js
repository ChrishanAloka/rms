const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

module.exports = mongoose.model("Supplier", supplierSchema);