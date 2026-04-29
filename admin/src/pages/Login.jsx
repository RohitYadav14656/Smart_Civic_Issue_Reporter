import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authorityAPI } from "../services/api.js";
import { useToast } from "../contexts/ToastContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ pincode: "", password: "" });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pincode || !form.password) { addToast("All fields required", "error"); return; }
    if (!/^\d{6}$/.test(form.pincode)) { addToast("Pincode must be 6 digits", "error"); return; }
    try {
      setLoading(true);
      const res = await authorityAPI.login(form);
      login(res.token, res.data);
      addToast(`Welcome, ${res.data.username}! 👋`, "success");
      navigate("/");
    } catch (err) {
      addToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "16px", margin: "0 auto 14px",
            background: "linear-gradient(135deg,#1a56db,#1341b5)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem",
            boxShadow: "0 8px 24px rgba(26,86,219,0.35)",
          }}>🔐</div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "1.5rem", marginBottom: "6px" }}>Authority Login</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Sign in to manage your area's civic issues</p>
        </div>

        <div className="glass-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label className="form-label">Pincode</label>
              <input className="form-input" name="pincode" value={form.pincode} onChange={handleChange} placeholder="Your area pincode" maxLength={6} />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "13px" }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
