const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// Add new attendance
exports.addAttendance = async (req, res) => {
  const { employeeId, date, inTime, outTime, breakStart, breakEnd } = req.body;

  if (!employeeId || !date || !inTime || !outTime) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    // Convert time strings to Date objects
    const inDate = new Date(`2000-01-01T${inTime}:00`);
    const outDate = new Date(`2000-01-01T${outTime}:00`);

    let totalMs = outDate - inDate;
    let totalHours = totalMs / 3600000; // ms → hours

    // Handle break
    if (breakStart && breakEnd) {
      const breakStartD = new Date(`2000-01-01T${breakStart}:00`);
      const breakEndD = new Date(`2000-01-01T${breakEnd}:00`);
      const breakMs = breakEndD - breakStartD;
      totalHours -= breakMs / 3600000;
    }

    const newAttendance = new Attendance({
      ...req.body,
      totalHours: totalHours.toFixed(2)
    });

    await newAttendance.save();
    res.json(newAttendance);
  } catch (err) {
    console.error("Failed to add attendance:", err.message);
    res.status(500).json({ error: "Failed to save attendance" });
  }
};

// Get all attendance for an employee
exports.getAttendanceByEmployee = async (req, res) => {
  const { id, month, year } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  const query = { employeeId: id };

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    query.date = { $gte: start, $lte: end };
  }

  try {
    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to load attendance" });
  }
};

// Get all employees with summary
exports.getAllEmployeesWithAttendance = async (req, res) => {
  try {
    const employees = await Employee.find({});
    const result = [];

    for (let emp of employees) {
      const attendances = await Attendance.find({
        employeeId: emp._id
      });

      let totalDays = attendances.length;
      let totalHours = attendances.reduce((sum, a) => sum + a.totalHours, 0);

      result.push({
        ...emp.toObject(),
        totalDays,
        totalHours
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to load employees" });
  }
};