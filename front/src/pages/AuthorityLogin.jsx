import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { authorityAPI } from "../services/api.js";
import { useToast } from "../contexts/ToastContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const AuthorityLoginPage = () => {
  const navigate  = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ pincode: "", password: "" });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pincode || !form.password) { addToast("All fields are required", "error"); return; }
    if (!/^\d{6}$/.test(form.pincode)) { addToast("Pincode must be 6 digits", "error"); return; }
    try {
      setLoading(true);
      const res = await authorityAPI.login(form);
      localStorage.setItem("civix_token", res.token);
      localStorage.setItem("civix_authority", JSON.stringify(res.data));
      addToast(`Welcome back, ${res.data.username}! 👋`, "success");
      navigate("/");
    } catch (err) {
      addToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Icon + Title */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "18px", margin: "0 auto 16px",
              background: "linear-gradient(135deg,#1a56db,#1341b5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.8rem", boxShadow: "0 8px 24px rgba(26,86,219,0.35)",
            }}>🏛️</div>
            <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "1.6rem", marginBottom: "6px" }}>Authority Login</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Sign in to manage civic issues in your jurisdiction</p>
          </div>

          <div className="glass-card" style={{ padding: "32px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label className="form-label">Pincode</label>
                <input className="form-input" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit area pincode" maxLength={6} />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "13px", marginTop: "4px" }}>
                {loading ? <LoadingSpinner text="Signing in…" /> : "🔐 Sign In"}
              </button>
            </form>

            <div className="divider" />
            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
              New municipality?{" "}
              <a href="http://localhost:5174/signup" target="_blank" rel="noreferrer" style={{ color: "#93c5fd", textDecoration: "none" }}>
                Register via Admin Panel →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLoginPage;
