// backend/controllers/reportController.js
const Order = require("../models/Order");
const KitchenBill = require("../models/KitchenBill");

exports.getMonthlyReport = async (req, res) => {
  const { month = new Date().getMonth(), year = new Date().getFullYear() } = req.query;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, parseInt(month) + 1, 0);

  try {
    // Calculate daily net income from orders
    const incomeData = await Order.aggregate([
      {
        $match: {
          date: { $gte: firstDay, $lte: lastDay },
          status: "Ready"
        }
      },
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalRevenue: { $sum: "$items.price" },
          totalCost: { $sum: "$items.cost" }
        }
      },
      {
        $addFields: {
          netIncome: { $subtract: ["$totalRevenue", "$totalCost"] }
        }
      },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          totalCost: 1,
          netIncome: 1
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Group kitchen bills by day and sum amount
    const expenseData = await KitchenBill.aggregate([
      {
        $match: {
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const incomeMap = {};
    incomeData.forEach((doc) => {
      incomeMap[doc._id] = doc.netIncome;
    });

    const expenseMap = {};
    expenseData.forEach((doc) => {
      expenseMap[doc._id] = doc.total;
    });

    const allDates = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])].sort();

    const monthlyIncome = {};
    const monthlyExpenses = {};

    allDates.forEach((date) => {
      monthlyIncome[date] = incomeMap[date] || 0;
      monthlyExpenses[date] = expenseMap[date] || 0;
    });

    const totalIncome = Object.values(monthlyIncome).reduce((a, b) => a + b, 0);
    const totalExpenses = Object.values(monthlyExpenses).reduce((a, b) => a + b, 0);
    const netProfit = totalIncome - totalExpenses;

    res.json({
      monthlyIncome,
      monthlyExpenses,
      totalIncome,
      totalExpenses,
      netProfit
    });
  } catch (err) {
    console.error("Report failed:", err.message);
    res.status(500).json({ error: "Failed to generate report" });
  }
};