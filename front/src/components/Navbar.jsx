import React from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/issues", label: "Browse Issues" },
  { to: "/report", label: "Report Issue" },
];

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: "64px" }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #1a56db, #1341b5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem", boxShadow: "0 4px 14px rgba(26,86,219,0.4)"
          }}>🏛️</div>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#e8edf8" }}>
            Civi<span style={{ color: "#1a56db" }}>x</span>
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                padding: "7px 16px",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.2s ease",
                color: pathname === to ? "#93c5fd" : "var(--color-text-muted)",
                background: pathname === to ? "rgba(26,86,219,0.12)" : "transparent",
                border: pathname === to ? "1px solid rgba(26,86,219,0.2)" : "1px solid transparent",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth CTA */}
        <Link to="/authority-login" className="btn-secondary" style={{ fontSize: "0.82rem", padding: "7px 16px" }}>
          🔒 Authority Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
