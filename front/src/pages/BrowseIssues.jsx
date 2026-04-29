import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import IssueCard from "../components/IssueCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { StatusBadge } from "../components/IssueCard.jsx";
import { issueAPI } from "../services/api.js";
import { useToast } from "../contexts/ToastContext.jsx";

const STATUSES  = ["", "pending", "in_progress", "resolved", "rejected"];
const CATEGORIES = ["", "pothole", "garbage", "water_leakage", "streetlight", "sewage", "road_damage", "other"];

const IssueDetailModal = ({ issue, onClose }) => {
  if (!issue) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "1.2rem", marginBottom: "8px" }}>{issue.title}</h2>
            <StatusBadge status={issue.status} />
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {issue.imageUrl && (
          <img src={issue.imageUrl} alt={issue.title} style={{ width: "100%", borderRadius: "12px", marginBottom: "20px", objectFit: "cover", maxHeight: "260px" }} />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Row label="Category"    value={issue.category?.replace("_", " ")} />
          <Row label="Address"     value={issue.address} />
          <Row label="Pincode"     value={issue.pincode} />
          <Row label="Description" value={issue.description} />
          {issue.reporterName && issue.reporterName !== "Anonymous" && <Row label="Reporter" value={issue.reporterName} />}
          <Row label="Reported on" value={new Date(issue.createdAt).toLocaleString("en-IN")} />
          {issue.resolvedAt && <Row label="Resolved on" value={new Date(issue.resolvedAt).toLocaleString("en-IN")} />}
        </div>

        {issue.comments?.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <div className="divider" />
            <h4 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Authority Updates</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {issue.comments.map((c, i) => (
                <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", borderLeft: "3px solid var(--color-primary)" }}>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text)", marginBottom: "4px" }}>{c.text}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>— {c.author} · {new Date(c.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "8px" }}>
    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: "2px" }}>{label}</span>
    <span style={{ fontSize: "0.9rem", color: "var(--color-text)", lineHeight: 1.5 }}>{value}</span>
  </div>
);

const BrowseIssuesPage = () => {
  const { addToast } = useToast();
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters]     = useState({ search: "", status: "", category: "", pincode: "" });

  const fetchIssues = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await issueAPI.getAll({ ...filters, page, limit: 12 });
      setIssues(res.data);
      setPagination(res.pagination);
    } catch (err) {
      addToast(err.message || "Failed to load issues", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => { fetchIssues(1); }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  return (
    <div>
      <Navbar />
      {selected && <IssueDetailModal issue={selected} onClose={() => setSelected(null)} />}

      <div className="page-wrapper" style={{ padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 className="section-title">Browse Issues</h1>
          <p className="section-subtitle">
            {pagination.total} issue{pagination.total !== 1 ? "s" : ""} reported across all areas
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card" style={{ padding: "20px", marginBottom: "28px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px" }}>
          <input className="form-input" name="search" value={filters.search} onChange={handleFilterChange} placeholder="🔍 Search title, address, description…" />
          <input className="form-input" name="pincode" value={filters.pincode} onChange={handleFilterChange} placeholder="📮 Filter by pincode" maxLength={6} />
          <select className="form-input" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select className="form-input" name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingSpinner fullPage text="Fetching issues…" />
        ) : issues.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
            <p style={{ color: "var(--color-text-muted)" }}>No issues found. Try changing the filters.</p>
          </div>
        ) : (
          <>
            <div className="issue-grid">
              {issues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} onClick={setSelected} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "36px" }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => fetchIssues(p)}
                    style={{
                      width: "38px", height: "38px", borderRadius: "8px", border: "1px solid",
                      borderColor: p === pagination.page ? "var(--color-primary)" : "var(--color-border)",
                      background: p === pagination.page ? "rgba(26,86,219,0.15)" : "transparent",
                      color: p === pagination.page ? "#93c5fd" : "var(--color-text-muted)",
                      cursor: "pointer", fontWeight: 500, fontSize: "0.875rem",
                    }}
                  >{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseIssuesPage;
