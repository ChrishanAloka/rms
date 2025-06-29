// backend/routes/authRoute.js

const express = require("express");
const router = express.Router();
const { signup, login, getUsers, getSignupKeys, generateSignupKey, deleteSignupKey, updateUserRole, deactivateUser, reactivateUser } = require("../controllers/authController");
const { getMenus, createMenu, updateMenu, deleteMenu } = require("../controllers/menuController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
// ✅ Add this line:
const orderController = require("../controllers/orderController");
const {getCustomerByPhone, updateOrderStatus} = require("../controllers/orderController");
const { getMonthlyReport } = require("../controllers/reportController");

const { getBills, addBill, updateBill, deleteBill } = require("../controllers/kitchenBillController");

const forgotPasswordController = require("../controllers/forgotPasswordController");

const employeeController = require("../controllers/employeeController");

const currencyController = require("../controllers/currencyController");

const attendanceController = require("../controllers/attendanceController");

const supplierController = require("../controllers/supplierController");
const expenseController = require("../controllers/expenseController");
const salaryController = require("../controllers/salaryController");

const kitchenRequestController = require("../controllers/kitchenRequestController");

const adminController = require("../controllers/adminController");


// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route - Admin only
router.get("/users", authMiddleware(["admin"]), getUsers); // ✅ Now protected
// Protected routes - Admin only
router.get("/signup-keys", authMiddleware(["admin"]), getSignupKeys);
router.post("/generate-key", authMiddleware(["admin"]), generateSignupKey);
router.delete("/signup-key/:id", authMiddleware(["admin"]), deleteSignupKey);

// Role management
router.put("/user/:id/role", authMiddleware(["admin"]), updateUserRole);
router.put("/user/:id/deactivate", authMiddleware(["admin"]), deactivateUser);
router.put("/user/reactivate/:id", authMiddleware(["admin"]), reactivateUser);

// Admin & Kitchen can manage menus
// backend/routes/authRoute.js
router.get("/menus", authMiddleware(["admin", "kitchen", "cashier"]), getMenus);
router.post("/menu", authMiddleware(["admin", "kitchen"]), upload.single("image"), createMenu);
// backend/routes/authRoute.js

router.put("/menu/:id", authMiddleware(["admin", "kitchen"]), upload.single("image"), updateMenu);
router.delete("/menu/:id", authMiddleware(["admin", "kitchen"]), deleteMenu);

// backend/routes/authRoute.js
// ✅ New Order Routes
router.post("/order", authMiddleware(["cashier"]), orderController.createOrder); // Now defined
// backend/routes/authRoute.js

router.get("/order/:id", authMiddleware(["admin", "cashier"]), orderController.getOrderById);

router.get("/orders", authMiddleware(["cashier", "kitchen"]), orderController.getOrderHistory);
router.put("/order/:id/status", authMiddleware(["kitchen", "admin"]), orderController.updateOrderStatus);
router.get("/orders/export/excel", authMiddleware(["admin", "cashier", "kitchen"]), orderController.exportOrdersToExcel);

router.get("/customer", authMiddleware(["cashier"]), getCustomerByPhone);

router.put("/order/:id/status", authMiddleware(["kitchen", "admin"]), updateOrderStatus);

// GET /kitchen/bills → list all
router.get("/kitchen/bills", authMiddleware(["admin", "kitchen"]), getBills);

// POST /kitchen/bill → add new
router.post("/kitchen/bill", authMiddleware(["admin", "kitchen"]), addBill);

// PUT /kitchen/bill/:id → update existing
router.put("/kitchen/bill/:id", authMiddleware(["admin", "kitchen"]), updateBill);

// DELETE /kitchen/bill/:id → remove
router.delete("/kitchen/bill/:id", authMiddleware(["admin", "kitchen"]), deleteBill);

// Kitchen Requests - For Kitchen Staff
router.post("/kitchen/request", authMiddleware(["kitchen"]), kitchenRequestController.submitRequest);
router.get("/kitchen/my-requests", authMiddleware(["kitchen"]), kitchenRequestController.getMyRequests);

// Kitchen Requests - For Admin
router.get("/kitchen/requests", authMiddleware(["admin"]), kitchenRequestController.getAllRequests);
router.put("/kitchen/request/:id/status", authMiddleware(["admin"]), kitchenRequestController.updateRequestStatus);

router.get("/report/monthly", authMiddleware(["kitchen", "admin"]), getMonthlyReport);

router.post("/forgot-password", forgotPasswordController.forgotPassword);
router.post("/reset-password/:token", forgotPasswordController.resetPassword);

// Register & view employees
router.post("/employee/register", authMiddleware(["admin"]), employeeController.registerEmployee);
router.get("/employees", authMiddleware(["admin"]), employeeController.getAllEmployees);
router.get("/employee/:id", authMiddleware(["admin"]), employeeController.getEmployeeById);
router.put("/employee/:id", authMiddleware(["admin"]), employeeController.updateEmployee);
router.delete("/employee/:id", authMiddleware(["admin"]), employeeController.deleteEmployee);

// Attendance Routes
router.post("/attendance/add", authMiddleware(["admin"]), attendanceController.addAttendance);
router.get("/attendance/list", authMiddleware(["admin"]), attendanceController.getAllEmployeesWithAttendance);
router.get("/attendance/by-employee", authMiddleware(["admin"]), attendanceController.getAttendanceByEmployee);

// Currency Settings
router.get("/settings/currency", authMiddleware(["admin"]), currencyController.getCurrency);
router.put("/settings/currency", authMiddleware(["admin"]), currencyController.updateCurrency);

// Suppliers
router.post("/supplier/register", authMiddleware(["admin"]), supplierController.registerSupplier);
router.put("/supplier/:id", authMiddleware(["admin"]), supplierController.editSupplier);
router.delete("/supplier/:id", authMiddleware(["admin"]), supplierController.deleteSupplier);
router.get("/suppliers", authMiddleware(["admin"]), supplierController.getAllSuppliers);

// Expenses
router.post("/expense/add", authMiddleware(["admin"]), expenseController.addExpense);
router.get("/expenses", authMiddleware(["admin"]), expenseController.getAllExpenses);

// Salaries
router.post("/salary/add", authMiddleware(["admin"]), salaryController.addSalary);
router.get("/salaries", authMiddleware(["admin"]), salaryController.getAllSalaries);

router.get("/admin/summary", authMiddleware(["admin"]), adminController.getDashboardSummary);



module.exports = router;