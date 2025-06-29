const Supplier = require("../models/Supplier");

// Register new supplier
exports.registerSupplier = async (req, res) => {
  const { name, contact, email, address } = req.body;

  try {
    const existing = await Supplier.findOne({ name });
    if (existing) return res.status(400).json({ error: "Supplier already exists" });

    const newSupplier = new Supplier({
      name,
      contact,
      email,
      address,
      addedBy: req.user.id
    });

    await newSupplier.save();
    res.json(newSupplier);
  } catch (err) {
    console.error("Failed to register supplier:", err.message);
    res.status(500).json({ error: "Server error. Could not register supplier." });
  }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: "Failed to load suppliers" });
  }
};

// Edit supplier
exports.editSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, contact, email, address } = req.body;

  try {
    const updated = await Supplier.findByIdAndUpdate(
      id,
      { name, contact, email, address },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Update failed:", err.message);
    res.status(500).json({ error: "Failed to update supplier" });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    await Supplier.findByIdAndDelete(id);
    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err.message);
    res.status(500).json({ error: "Failed to delete supplier" });
  }
};