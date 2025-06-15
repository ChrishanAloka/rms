// backend/controllers/menuController.js
const Menu = require("../models/Menu");
const path = require("path");

// Helper function to safely parse numbers
function parseNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

// GET /menus - Get all menus
exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.find({});
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menus" });
  }
};

// POST /menu - Create new menu
exports.createMenu = async (req, res) => {
  const { name, description, price, cost, category, minimumQty, currentQty } = req.body;

  // Parse numbers
  const parsedPrice = parseNumber(price);
  const parsedCost = parseNumber(cost);
  const parsedMinimumQty = parseInt(minimumQty);
  const parsedCurrentQty = parseInt(currentQty);

  if (
    isNaN(parsedPrice) ||
    isNaN(parsedCost) ||
    isNaN(parsedMinimumQty) ||
    isNaN(parsedCurrentQty)
  ) {
    return res.status(400).json({ error: "Price, Cost, and Quantity must be valid numbers" });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.jpg";

  try {
    const newMenu = new Menu({
      name,
      description,
      price: parsedPrice,
      cost: parsedCost,
      category: category || "Main Course",
      imageUrl,
      isActive: true,
      minimumQty: parsedMinimumQty,
      currentQty: parsedCurrentQty
    });

    await newMenu.save();
    res.status(201).json(newMenu);
  } catch (err) {
    console.error("Create failed:", err.message);
    res.status(400).json({ error: "Failed to add menu item" });
  }
};

// PUT /menu/:id - Update menu
exports.updateMenu = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const price = parseNumber(updates.price);
  const cost = parseNumber(updates.cost);
  const minimumQty = parseInt(updates.minimumQty);
  const currentQty = parseInt(updates.currentQty);

  if (
    isNaN(price) ||
    isNaN(cost) ||
    isNaN(minimumQty) ||
    isNaN(currentQty)
  ) {
    return res.status(400).json({ error: "Price, Cost, and Quantity must be valid numbers" });
  }

  updates.price = price;
  updates.cost = cost;
  updates.minimumQty = minimumQty;
  updates.currentQty = currentQty;

  // Handle image upload
  if (req.file) {
    updates.imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const updated = await Menu.findByIdAndUpdate(id, { $set: updates }, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: "Menu not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update failed:", err.message);
    res.status(500).json({ error: "Failed to update menu" });
  }
};

// DELETE /menu/:id - Delete menu
exports.deleteMenu = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Menu.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Menu not found" });
    }
    res.json({ message: "Menu deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu" });
  }
};