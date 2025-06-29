const Employee = require("../models/Employee");

// Register new employee
exports.registerEmployee = async (req, res) => {
  const {
    id,
    name,
    nic,
    address,
    phone,
    basicSalary,
    workingHours,
    otHourRate,
    bankAccountNo,
    role
  } = req.body;

  if (!id || !name || !nic || !phone || !basicSalary || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existingNIC = await Employee.findOne({ nic });
    if (existingNIC) {
      return res.status(400).json({ error: "NIC already registered" });
    }

    const newEmployee = new Employee({
      id,
      name,
      nic,
      address,
      phone,
      basicSalary,
      workingHours,
      otHourRate,
      bankAccountNo,
      role
    });

    await newEmployee.save();
    res.json(newEmployee);
  } catch (err) {
    console.error("Register failed:", err.message);
    res.status(500).json({ error: "Failed to register employee" });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to load employees" });
  }
};

// Get one employee
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: "Failed to load employee" });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updated = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update failed:", err.message);
    res.status(500).json({ error: "Failed to update employee" });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err.message);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};