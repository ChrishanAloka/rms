// backend/models/Menu.js
const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
    // ✅ Removed unique constraint
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ["Appetizer", "Main Course", "Dessert", "Drink"],
    default: "Main Course"
  },
  imageUrl: String,
  isActive: {
    type: Boolean,
    default: true
  },
  minimumQty: {
    type: Number,
    default: 5
  },
  currentQty: {
    type: Number,
    default: function () {
      return this.minimumQty || 5;
    }
  },
  menuStatus: {
    type: String,
    enum: ["In Stock", "Low Stock", "Out of Stock"],
    default: "In Stock"
  }
});

// Optional: Add index on name + category if needed later
// menuSchema.index({ name: 1, category: 1 }, { unique: false });

module.exports = mongoose.model("Menu", menuSchema);