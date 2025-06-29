const Expense = require("../models/Expense");

exports.addExpense = async (req, res) => {
  const { supplier, amount, description } = req.body;

  if (!supplier || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newExpense = new Expense({
      supplier,
      amount,
      description,
      date: new Date()
    });

    await newExpense.save();
    res.json(newExpense);
  } catch (err) {
    res.status(500).json({ error: "Failed to add expense" });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({}).populate("supplier");
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to load expenses" });
  }
};