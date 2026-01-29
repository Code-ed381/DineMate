// App.tsx
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/layout/layout";
import Dashboard from "./pages/dashboard";
import Menu from "./pages/menu";
import Employees from "./pages/admin/employees-management";
import MenuItemsManagement from "./pages/admin/items-managment";
import Report from "./pages/report";
import Kitchen from "./pages/kitchen";
import Profile from "./pages/profile";
import SignIn from "./pages/auth/signIn";
import SignUp from "./pages/auth/signUp";
import TableManagement from "./pages/admin/tables-management";
import ProtectedRoute from "./pages/auth/components/ProtectedRoute";
import Settings from "./pages/settings";
import Cashier from "./pages/cashier";
import Bar from "./pages/bar";
import RestaurantGrid from "./pages/restaurantSelectionPage";
import ResetPassword from "./pages/auth/resetPassword";
import Onboarding from "./pages/auth/onboarding";
import Tables from "./pages/tables";
import Index from "./pages/index";
import CashierDetailedReports from "./pages/cashier-detailed-reports";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/">
          <Route index element={<Index />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route
            path="restaurant-selection"
            element={
              <ProtectedRoute>
                <RestaurantGrid />
              </ProtectedRoute>
            }
          />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Route>
        <Route
          path="/app/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="menu" element={<Menu />} />
          <Route path="tables" element={<Tables />} />
          <Route path="tables-management" element={<TableManagement />} />
          <Route
            path="menu-items-management"
            element={<MenuItemsManagement />}
          />
          <Route path="employees" element={<Employees />} />
          <Route path="report" element={<Report />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="cashier" element={<Cashier />} />
          <Route path="cashier-reports" element={<CashierDetailedReports />} />
          <Route path="bar" element={<Bar />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
