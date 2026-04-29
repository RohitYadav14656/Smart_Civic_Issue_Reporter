import React, { useState, useCallback } from "react";
import { issueAPI } from "../services/api.js";
import { useToast } from "../contexts/ToastContext.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

const CATEGORIES = [
  { value: "pothole",       label: "🕳️ Pothole" },
  { value: "garbage",       label: "🗑️ Garbage" },
  { value: "water_leakage", label: "💧 Water Leakage" },
  { value: "streetlight",   label: "💡 Streetlight" },
  { value: "sewage",        label: "🚿 Sewage" },
  { value: "road_damage",   label: "🛣️ Road Damage" },
  { value: "other",         label: "📋 Other" },
];

const ReportForm = ({ onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "other",
    address: "", pincode: "", reporterName: "", reporterEmail: "",
    image: null, lat: "", lng: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.[0]) {
      setForm((p) => ({ ...p, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setForm((p) => ({ ...p, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) { addToast("Geolocation not supported", "error"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        addToast("📍 Location captured!", "success");
      },
      () => addToast("Could not get location", "error")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.address || !form.pincode) {
      addToast("Please fill all required fields", "error"); return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      addToast("Pincode must be exactly 6 digits", "error"); return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v && k !== "image") fd.append(k, v); });
      if (form.image) fd.append("image", form.image);
      await issueAPI.create(fd);
      addToast("✅ Issue reported successfully!", "success");
      setForm({ title: "", description: "", category: "other", address: "", pincode: "", reporterName: "", reporterEmail: "", image: null, lat: "", lng: "" });
      setPreview(null);
      onSuccess?.();
    } catch (err) {
      addToast(err.message || "Failed to submit issue", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Title + Category row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label className="form-label">Issue Title *</label>
          <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Large pothole on main road" />
        </div>
        <div>
          <label className="form-label">Category *</label>
          <select className="form-input" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="form-label">Description *</label>
        <textarea className="form-input" name="description" value={form.description} onChange={handleChange}
          placeholder="Describe the issue in detail..." rows={3} style={{ resize: "vertical", lineHeight: 1.6 }} />
      </div>

      {/* Address + Pincode */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        <div>
          <label className="form-label">Address *</label>
          <input className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="Street, Area, Landmark" />
        </div>
        <div>
          <label className="form-label">Pincode *</label>
          <input className="form-input" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} />
        </div>
      </div>

      {/* Reporter info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label className="form-label">Your Name (Optional)</label>
          <input className="form-input" name="reporterName" value={form.reporterName} onChange={handleChange} placeholder="Anonymous" />
        </div>
        <div>
          <label className="form-label">Email for Updates (Optional)</label>
          <input className="form-input" type="email" name="reporterEmail" value={form.reporterEmail} onChange={handleChange} placeholder="you@example.com" />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="form-label">Geolocation</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" className="btn-secondary" onClick={getLocation} style={{ whiteSpace: "nowrap" }}>
            📍 Capture My Location
          </button>
          {form.lat && (
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              {parseFloat(form.lat).toFixed(4)}°, {parseFloat(form.lng).toFixed(4)}°
            </span>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="form-label">Photo Evidence</label>
        <div
          className={`upload-box ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("img-input").click()}
        >
          <input id="img-input" type="file" name="image" accept="image/*" onChange={handleChange} style={{ display: "none" }} />
          {preview ? (
            <div>
              <img src={preview} alt="preview" style={{ maxHeight: "180px", borderRadius: "8px", objectFit: "cover" }} />
              <p style={{ marginTop: "8px", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Click or drop to replace</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📷</div>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Drag & drop or click to upload</p>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.78rem", marginTop: "4px" }}>Max 5MB · JPG, PNG, WEBP</p>
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: "flex-start", padding: "13px 32px", fontSize: "0.95rem" }}>
        {loading ? <><LoadingSpinner text="" /> Submitting…</> : "🚀 Submit Report"}
      </button>
    </form>
  );
};

export default ReportForm;
