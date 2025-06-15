// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import AdminLogin from './components/AdminLogin';
import CashierLogin from './components/CashierLogin';
import KitchenLogin from './components/KitchenLogin';

import CashierSignup from "./components/CashierSignup";
import KitchenSignup from "./components/KitchenSignup";
import AdminSignup from "./components/AdminSignup";

import Signup from './components/Signup';
import Admin from './components/AdminLanding';
import KitchenLanding from "./components/KitchenLanding";
import KitchenBills from "./components/KitchenBills";

import KitchenOrderHistory from "./components/KitchenOrderHistory";

import CashierLanding from "./components/CashierLanding";
import ProtectedRoute from "./components/ProtectedRoute";

import CashierOrderHistory from "./components/CashierOrderHistory";
import CashierDashboard from "./components/CashierDashboard";

 // ✅ Import layout
import RoleLayout from "./components/RoleLayout";

import MenuManagement from "./components/MenuManagement";
import MonthlyReport from "./components/MonthlyReport";


// Admin Pages
import AdminDashboard from "./components/AdminDashboard";   // ✅ Add
import AdminUsers from "./components/AdminUsers";           // ✅ Add
import AdminSignupKey from "./components/AdminSignupKey";   // ✅ Add

import Unauthorized from "./components/Unauthorized";

import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";


<Route path="/unauthorized" element={<Unauthorized />} />

function App() {
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/cashier-login" element={<CashierLogin />} />
      <Route path="/kitchen-login" element={<KitchenLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      <Route path="/cashier-signup" element={<CashierSignup />} />
      <Route path="/kitchen-signup" element={<KitchenSignup />} />
      <Route path="/admin-signup" element={<AdminSignup />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <RoleLayout />  {/* Wrap inside layout */}
          </ProtectedRoute>
        }
      >
        <Route index path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/signup-key" element={<AdminSignupKey />} />
      </Route>
      
      <Route
        element={
          <ProtectedRoute allowedRoles={["kitchen"]}>
            <RoleLayout /> 
          </ProtectedRoute>
        }
      >
        <Route path="/kitchen" element={<KitchenLanding />} />
        <Route path="/kitchen/history" element={<KitchenOrderHistory />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["cashier"]}>
            <RoleLayout /> 
          </ProtectedRoute>
        }
      >
        <Route path="/cashier" element={<CashierLanding />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "kitchen"]}>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/:role/menu" element={<MenuManagement />} />
      </Route>
      
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "kitchen"]}>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/:role/report" element={<MonthlyReport />} />
        <Route path="/:role/bills" element={<KitchenBills />} />  {/* ✅ New route */}
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["cashier"]}>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/cashier/orders" element={<CashierOrderHistory />} />
        <Route path="/cashier/today" element={<CashierDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;