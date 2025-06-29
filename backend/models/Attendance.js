// backend/models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  inTime: {
    type: String, // Format: "HH:mm"
    required: true
  },
  breakStart: {
    type: String, // Optional
    default: null
  },
  breakEnd: {
    type: String, // Optional
    default: null
  },
  outTime: {
    type: String, // Format: "HH:mm"
    default: null
  },
  totalHours: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);