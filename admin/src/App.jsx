import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";

import Admin    from "./pages/Admin.jsx";
import IssuesPage from "./pages/Issues.jsx";
import Signup   from "./pages/Signup.jsx";
import LoginPage from "./pages/Login.jsx";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"  element={<LoginPage />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/"       element={<ProtectedRoute><Admin /></ProtectedRoute>} />
    <Route path="/issues" element={<ProtectedRoute><IssuesPage /></ProtectedRoute>} />
    {/* Legacy admin route */}
    <Route path="/onlyforadminakjfdbk" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  </AuthProvider>
);

export default App;
