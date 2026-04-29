import React from "react";
import Navbar from "../components/Navbar.jsx";
import ReportForm from "../components/ReportForm.jsx";
import { useNavigate } from "react-router-dom";

const ReportIssuePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="page-wrapper" style={{ padding: "40px 24px 80px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: "7px 14px", fontSize: "0.82rem" }}>← Back</button>
            </div>
            <h1 className="section-title">Report a Civic Issue</h1>
            <p className="section-subtitle">Fill in the details below. Your report goes directly to the responsible municipal authority.</p>
          </div>

          {/* Tips banner */}
          <div style={{
            display: "flex", gap: "16px", padding: "16px 20px",
            background: "rgba(26,86,219,0.08)", border: "1px solid rgba(26,86,219,0.18)",
            borderRadius: "12px", marginBottom: "28px",
          }}>
            <span style={{ fontSize: "1.3rem" }}>💡</span>
            <div style={{ fontSize: "0.82rem", color: "#93c5fd", lineHeight: 1.6 }}>
              <strong>Tips for a good report:</strong> Be specific about the location, add a clear photo, and choose the correct category to ensure faster resolution.
            </div>
          </div>

          {/* Form card */}
          <div className="glass-card" style={{ padding: "36px" }}>
            <ReportForm onSuccess={() => navigate("/issues")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;
