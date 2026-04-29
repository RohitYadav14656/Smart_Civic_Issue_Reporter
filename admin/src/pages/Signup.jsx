import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authorityAPI } from "../services/api.js";
import { useToast } from "../contexts/ToastContext.jsx";

const SignupPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", pincode: "", password: "", confirmPassword: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "pincode" ? value.replace(/\D/g, "") : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.pincode || !form.password) {
      addToast("All fields are required", "error"); return;
    }
    if (form.pincode.length !== 6) { addToast("Pincode must be 6 digits", "error"); return; }
    if (form.password.length < 6) { addToast("Password must be at least 6 characters", "error"); return; }
    if (form.password !== form.confirmPassword) { addToast("Passwords do not match", "error"); return; }

    try {
      setLoading(true);
      await authorityAPI.signup({ username: form.username, pincode: form.pincode, password: form.password });
      addToast("✅ Authority registered successfully!", "success");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      addToast(err.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "16px", margin: "0 auto 14px",
            background: "linear-gradient(135deg,#1a56db,#1341b5)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem",
            boxShadow: "0 8px 24px rgba(26,86,219,0.35)",
          }}>🏛️</div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "1.5rem", marginBottom: "6px" }}>
            Register Authority
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            Add a new municipal authority to Civix
          </p>
        </div>

        <div className="glass-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label className="form-label">Authority / Municipality Name</label>
              <input className="form-input" name="username" value={form.username} onChange={handleChange} placeholder="e.g. Mumbai North Ward" />
            </div>
            <div>
              <label className="form-label">Area Pincode</label>
              <input className="form-input" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "13px", marginTop: "4px" }}>
              {loading ? "Registering…" : "➕ Register Authority"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <a href="/" style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", textDecoration: "none" }}>← Back to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;