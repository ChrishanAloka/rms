const Order = require("../models/Order");
const Expense = require("../models/Expense");
const Salary = require("../models/Salary");
const KitchenBill = require("../models/KitchenBill");

exports.getDashboardSummary = async (req, res) => {
  try {
    const [orders, expenses, salaries, KitchenBills] = await Promise.all([
      Order.find({}),
      Expense.find({}),
      Salary.find({}),
      KitchenBill.find({})
    ]);

    const totalIncome = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSalaries = salaries.reduce((sum, s) => sum + s.total, 0);
    const totalBills = KitchenBills.reduce((sum, b) => sum + b.amount, 0);

    const totalCost = totalExpenses + totalSalaries + totalBills;
    const netProfit = totalIncome - totalCost;

    res.json({
      totalIncome,
      totalExpenses,
      totalSalaries,
      totalBills,
      totalCost,
      netProfit
    });

  } catch (err) {
    console.error("Failed to load dashboard summary:", err.message);
    res.status(500).json({ error: "Server error. Could not load summary." });
  }
};