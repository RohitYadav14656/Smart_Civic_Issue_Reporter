import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const STATS = [
  { icon: "🏙️", count: "10K+", label: "Issues Reported" },
  { icon: "✅", count: "7K+",  label: "Issues Resolved" },
  { icon: "🏛️", count: "200+", label: "Municipalities" },
  { icon: "⚡", count: "48h",  label: "Avg Resolution" },
];

const FEATURES = [
  { icon: "📸", title: "Photo Evidence", desc: "Attach photos directly from your phone to strengthen your report." },
  { icon: "📍", title: "Precise Location", desc: "One-tap GPS capture so authorities find the issue instantly." },
  { icon: "🔄", title: "Live Status Tracking", desc: "Track your report from pending → in-progress → resolved in real time." },
  { icon: "🏛️", title: "Direct to Municipality", desc: "Reports are pincode-routed straight to the responsible authority." },
];

const CATEGORIES = [
  { icon: "🕳️", label: "Potholes" },
  { icon: "🗑️", label: "Garbage" },
  { icon: "💧", label: "Water Leakage" },
  { icon: "💡", label: "Streetlights" },
  { icon: "🚿", label: "Sewage" },
  { icon: "🛣️", label: "Road Damage" },
];

const HomePage = () => {
  return (
    <div>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0 60px", textAlign: "center", position: "relative" }}>
        <div className="page-wrapper">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px", borderRadius: "99px",
            background: "rgba(26,86,219,0.1)", border: "1px solid rgba(26,86,219,0.2)",
            marginBottom: "24px", fontSize: "0.82rem", color: "#93c5fd",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
            Live · Citizens reporting across India
          </div>

          <h1 style={{
            fontFamily: "'Poppins', sans-serif", fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            fontWeight: 800, lineHeight: 1.1, marginBottom: "20px",
            background: "linear-gradient(135deg, #e8edf8 30%, #93c5fd 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Report. Track.<br />Resolve Civic Issues.
          </h1>

          <p style={{ fontSize: "1.05rem", color: "var(--color-text-muted)", maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.7 }}>
            Civix bridges the gap between citizens and local government. Report potholes, garbage, water leaks, and more — directly to your municipality.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/report" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 32px" }}>
              🚀 Report an Issue
            </Link>
            <Link to="/issues" className="btn-secondary" style={{ fontSize: "1rem", padding: "14px 32px" }}>
              Browse Issues →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 0 60px" }}>
        <div className="page-wrapper">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
            {STATS.map((s) => (
              <div key={s.label} className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{s.icon}</div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: "#93c5fd" }}>{s.count}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 0 70px" }}>
        <div className="page-wrapper">
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 className="section-title">What Can You Report?</h2>
            <p className="section-subtitle">From potholes to broken streetlights — every civic issue matters.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "14px" }}>
            {CATEGORIES.map((c) => (
              <Link key={c.label} to={`/issues?category=${c.label.toLowerCase().replace(" ", "_")}`}
                className="glass-card"
                style={{ padding: "22px 12px", textAlign: "center", textDecoration: "none" }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{c.icon}</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--color-text-muted)" }}>{c.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 0 80px" }}>
        <div className="page-wrapper">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">Why Civix?</h2>
            <p className="section-subtitle">Built for speed, transparency, and accountability.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px" }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card" style={{ padding: "28px", display: "flex", gap: "20px" }}>
                <div style={{
                  width: "52px", height: "52px", flexShrink: 0, borderRadius: "14px",
                  background: "rgba(26,86,219,0.12)", border: "1px solid rgba(26,86,219,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: "1rem", marginBottom: "6px" }}>{f.title}</h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 0 80px" }}>
        <div className="page-wrapper">
          <div style={{
            background: "linear-gradient(135deg, rgba(26,86,219,0.2), rgba(19,65,181,0.1))",
            border: "1px solid rgba(26,86,219,0.25)", borderRadius: "24px",
            padding: "60px 40px", textAlign: "center",
          }}>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "2rem", fontWeight: 700, marginBottom: "14px" }}>
              See something broken? Report it now.
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "28px", fontSize: "0.95rem" }}>
              Takes less than 2 minutes. No account needed.
            </p>
            <Link to="/report" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 36px" }}>
              📢 File a Report
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--color-border)", padding: "28px 0", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem" }}>
          © 2025 Civix — Smart Civic Issue Reporter · Built for Indian citizens
        </p>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @media(max-width:900px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .cat-grid   { grid-template-columns: repeat(3,1fr) !important; }
          .feat-grid  { grid-template-columns: 1fr !important; }
        }
        @media(max-width:600px) {
          .cat-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
