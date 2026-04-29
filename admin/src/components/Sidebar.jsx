import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const LINKS = [
  { to: "/",        icon: "📊", label: "Dashboard" },
  { to: "/issues",  icon: "📋", label: "Issues" },
  { to: "/signup",  icon: "➕", label: "Register Authority" },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { authority, logout, isLoggedIn } = useAuth();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", paddingBottom: "20px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
          background: "linear-gradient(135deg,#1a56db,#1341b5)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
        }}>🏛️</div>
        <div>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#e8edf8" }}>
            Civi<span style={{ color: "#1a56db" }}>x</span>
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>Authority Panel</div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1 }}>
        {LINKS.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${pathname === to ? "active" : ""}`}
          >
            <span style={{ fontSize: "1rem" }}>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Authority info */}
      {isLoggedIn && authority && (
        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
          <div style={{ padding: "10px 14px", marginBottom: "8px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "2px" }}>
              {authority.username}
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-muted)" }}>
              📮 {authority.pincode}
            </div>
          </div>
          <button onClick={logout} className="btn-danger" style={{ width: "100%", justifyContent: "center" }}>
            🚪 Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
