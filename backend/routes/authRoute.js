// backend/routes/authRoute.js

const express = require("express");
const router = express.Router();
const { signup, login, getUsers, getSignupKeys, generateSignupKey, deleteSignupKey, updateUserRole, deactivateUser } = require("../controllers/authController");
const { getMenus, createMenu, updateMenu, deleteMenu } = require("../controllers/menuController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
// ✅ Add this line:
const orderController = require("../controllers/orderController");
const {getCustomerByPhone, updateOrderStatus} = require("../controllers/orderController");
const { getMonthlyReport } = require("../controllers/reportController");

const { getBills, addBill, updateBill, deleteBill } = require("../controllers/kitchenBillController");

const forgotPasswordController = require("../controllers/forgotPasswordController");


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

router.get("/report/monthly", authMiddleware(["kitchen", "admin"]), getMonthlyReport);

router.post("/forgot-password", forgotPasswordController.forgotPassword);
router.post("/reset-password/:token", forgotPasswordController.resetPassword);

module.exports = router;