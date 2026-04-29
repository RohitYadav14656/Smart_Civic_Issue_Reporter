import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext.jsx";

import HomePage          from "./pages/Home.jsx";
import BrowseIssuesPage  from "./pages/BrowseIssues.jsx";
import ReportIssuePage   from "./pages/ReportIssue.jsx";
import AuthorityLoginPage from "./pages/AuthorityLogin.jsx";

// Legacy: keep old routes working so nothing breaks
import Users      from "./pages/Users.jsx";
import Munciplity from "./pages/Munciplity.jsx";

const App = () => (
  <ToastProvider>
    <Routes>
      {/* New routes */}
      <Route path="/"                 element={<HomePage />} />
      <Route path="/issues"           element={<BrowseIssuesPage />} />
      <Route path="/report"           element={<ReportIssuePage />} />
      <Route path="/authority-login"  element={<AuthorityLoginPage />} />

      {/* Legacy routes preserved */}
      <Route path="/upload"     element={<Users />} />
      <Route path="/munciplity" element={<Munciplity />} />
    </Routes>
  </ToastProvider>
);

export default App;
