import React, { useState, useCallback, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { issueAPI } from "../services/api.js";
import { useToast } from "../contexts/ToastContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const STATUS_MAP = {
  pending:     { label: "Pending",     cls: "badge-pending",  icon: "⏳" },
  in_progress: { label: "In Progress", cls: "badge-progress", icon: "🔧" },
  resolved:    { label: "Resolved",    cls: "badge-resolved", icon: "✅" },
  rejected:    { label: "Rejected",    cls: "badge-rejected", icon: "❌" },
};
const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return <span className={`badge ${s.cls}`}>{s.icon} {s.label}</span>;
};

const STATUSES   = ["", "pending", "in_progress", "resolved", "rejected"];
const CATEGORIES = ["", "pothole", "garbage", "water_leakage", "streetlight", "sewage", "road_damage", "other"];

const IssuesPage = () => {
  const { addToast } = useToast();
  const { authority } = useAuth();
  const [issues, setIssues]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "", status: "", category: "",
    pincode: authority?.pincode || "",
  });

  const fetchIssues = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await issueAPI.getAll({ ...filters, page, limit: 15 });
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

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      setActionLoading(true);
      await issueAPI.updateStatus(issueId, newStatus, commentText);
      addToast(`Status updated to ${newStatus.replace("_", " ")}`, "success");
      setSelected(null);
      setCommentText("");
      fetchIssues(pagination.page);
    } catch (err) {
      addToast(err.message || "Update failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm("Permanently delete this issue?")) return;
    try {
      await issueAPI.delete(issueId);
      addToast("Issue deleted", "info");
      setSelected(null);
      fetchIssues(pagination.page);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px", overflowX: "hidden" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1.8rem", fontWeight: 700, marginBottom: "4px" }}>Issues</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            {pagination.total} total issue{pagination.total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card" style={{ padding: "18px", marginBottom: "24px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px" }}>
          <input className="form-input" name="search" value={filters.search} onChange={handleFilterChange} placeholder="🔍 Search…" />
          <input className="form-input" name="pincode" value={filters.pincode} onChange={handleFilterChange} placeholder="📮 Pincode" maxLength={6} />
          <select className="form-input" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
          </select>
          <select className="form-input" name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c.replace("_"," ")}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "64px", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : issues.length === 0 ? (
            <div style={{ padding: "64px", textAlign: "center", color: "var(--color-text-muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔍</div>
              No issues match your filters
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                      {["Title", "Category", "Pincode", "Status", "Reporter", "Date", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "13px 16px", fontSize: "0.875rem", fontWeight: 500, maxWidth: "180px" }}>
                          <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.title}</span>
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: "0.78rem", color: "var(--color-text-muted)", textTransform: "capitalize" }}>{issue.category?.replace("_"," ")}</td>
                        <td style={{ padding: "13px 16px", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>{issue.pincode}</td>
                        <td style={{ padding: "13px 16px" }}><StatusBadge status={issue.status} /></td>
                        <td style={{ padding: "13px 16px", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{issue.reporterName || "Anonymous"}</td>
                        <td style={{ padding: "13px 16px", fontSize: "0.78rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                          {new Date(issue.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <button className="btn-secondary" style={{ fontSize: "0.78rem", padding: "6px 12px" }} onClick={() => { setSelected(issue); setCommentText(""); }}>
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "16px" }}>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => fetchIssues(p)}
                      style={{
                        width: "36px", height: "36px", borderRadius: "8px", border: "1px solid",
                        borderColor: p === pagination.page ? "var(--color-primary)" : "var(--color-border)",
                        background: p === pagination.page ? "rgba(26,86,219,0.15)" : "transparent",
                        color: p === pagination.page ? "#93c5fd" : "var(--color-text-muted)",
                        cursor: "pointer", fontWeight: 500, fontSize: "0.82rem",
                      }}>{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Management Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
              <div>
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "8px" }}>{selected.title}</h2>
                <StatusBadge status={selected.status} />
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "1.3rem", cursor: "pointer" }}>✕</button>
            </div>

            {selected.imageUrl && (
              <img src={selected.imageUrl} alt={selected.title} style={{ width: "100%", borderRadius: "10px", marginBottom: "16px", maxHeight: "200px", objectFit: "cover" }} />
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
              {[["Address", selected.address], ["Description", selected.description], ["Reporter", selected.reporterName]].map(([l, v]) => v && (
                <div key={l} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "6px" }}>
                  <span style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</span>
                  <span style={{ fontSize: "0.85rem" }}>{v}</span>
                </div>
              ))}
            </div>

            <div className="divider" />
            <label className="form-label" style={{ marginBottom: "8px" }}>Update Comment (optional)</label>
            <textarea className="form-input" value={commentText} onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a note about the action taken…" rows={3} style={{ resize: "vertical", marginBottom: "16px" }} />

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["in_progress", "resolved", "rejected"].filter((s) => s !== selected.status).map((s) => (
                <button key={s}
                  className={s === "resolved" ? "btn-success" : s === "rejected" ? "btn-danger" : "btn-warning"}
                  disabled={actionLoading}
                  onClick={() => handleStatusUpdate(selected._id, s)}
                >
                  {s === "in_progress" ? "🔧 In Progress" : s === "resolved" ? "✅ Resolve" : "❌ Reject"}
                </button>
              ))}
              <button className="btn-danger" style={{ marginLeft: "auto" }} disabled={actionLoading} onClick={() => handleDelete(selected._id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
