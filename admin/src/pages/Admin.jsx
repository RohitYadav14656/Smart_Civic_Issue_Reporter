import React, { useState, useEffect, useCallback } from "react";
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

const STAT_CARDS = [
  { key: "total",       label: "Total Issues",   icon: "📋", color: "#1a56db", bg: "rgba(26,86,219,0.1)"  },
  { key: "pending",     label: "Pending",         icon: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  { key: "in_progress", label: "In Progress",     icon: "🔧", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { key: "resolved",    label: "Resolved",         icon: "✅", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
];

const Dashboard = () => {
  const { addToast } = useToast();
  const { authority } = useAuth();
  const [stats, setStats]   = useState({ total: 0, byStatus: {}, byCategory: [] });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const pincode = authority?.pincode;
      const [statsRes, issuesRes] = await Promise.all([
        issueAPI.getStats(pincode),
        issueAPI.getAll({ pincode, limit: 8, page: 1 }),
      ]);
      setStats(statsRes.data);
      setRecent(issuesRes.data);
    } catch (err) {
      addToast(err.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [authority, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      setActionLoading(true);
      await issueAPI.updateStatus(issueId, newStatus, commentText);
      addToast(`✅ Issue marked as ${newStatus.replace("_", " ")}`, "success");
      setSelectedIssue(null);
      setCommentText("");
      fetchData();
    } catch (err) {
      addToast(err.message || "Update failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm("Delete this issue? This cannot be undone.")) return;
    try {
      await issueAPI.delete(issueId);
      addToast("Issue deleted", "info");
      setSelectedIssue(null);
      fetchData();
    } catch (err) {
      addToast(err.message || "Delete failed", "error");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowX: "hidden" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1.8rem", fontWeight: 700, marginBottom: "4px" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            {authority ? `Managing issues for pincode ${authority.pincode}` : "All civic issues overview"}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "32px" }}>
          {STAT_CARDS.map(({ key, label, icon, color, bg }) => {
            const count = key === "total" ? stats.total : (stats.byStatus?.[key] || 0);
            return (
              <div key={key} className="glass-card" style={{ padding: "22px", display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1.6rem", fontWeight: 700, color, lineHeight: 1 }}>{count}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "3px" }}>{label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Issues Table */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: "1rem" }}>Recent Issues</h2>
            <a href="/issues" style={{ fontSize: "0.82rem", color: "#93c5fd", textDecoration: "none" }}>View all →</a>
          </div>

          {loading ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : recent.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--color-text-muted)" }}>No issues found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Title", "Category", "Address", "Pincode", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.74rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((issue) => (
                    <tr key={issue._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 16px", fontSize: "0.875rem", fontWeight: 500, maxWidth: "200px" }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.title}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", textTransform: "capitalize" }}>{issue.category?.replace("_"," ")}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "var(--color-text-muted)", maxWidth: "160px" }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.address}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>{issue.pincode}</td>
                      <td style={{ padding: "14px 16px" }}><StatusBadge status={issue.status} /></td>
                      <td style={{ padding: "14px 16px", fontSize: "0.78rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(issue.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button className="btn-secondary" style={{ fontSize: "0.78rem", padding: "6px 12px" }} onClick={() => setSelectedIssue(issue)}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Issue Management Modal */}
      {selectedIssue && (
        <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px" }}>{selectedIssue.title}</h2>
                <StatusBadge status={selectedIssue.status} />
              </div>
              <button onClick={() => setSelectedIssue(null)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "1.4rem", cursor: "pointer" }}>✕</button>
            </div>

            {selectedIssue.imageUrl && (
              <img src={selectedIssue.imageUrl} alt={selectedIssue.title} style={{ width: "100%", borderRadius: "10px", marginBottom: "18px", maxHeight: "220px", objectFit: "cover" }} />
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {[
                ["Category",    selectedIssue.category?.replace("_"," ")],
                ["Address",     selectedIssue.address],
                ["Pincode",     selectedIssue.pincode],
                ["Description", selectedIssue.description],
                ["Reporter",    selectedIssue.reporterName],
                ["Reported",    new Date(selectedIssue.createdAt).toLocaleString("en-IN")],
              ].map(([label, val]) => val && (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "8px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                  <span style={{ fontSize: "0.875rem", textTransform: label === "Category" ? "capitalize" : "none" }}>{val}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            {/* Comment input */}
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">Add a comment / update note</label>
              <textarea
                className="form-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Explain the action taken, estimated resolution time, etc."
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {selectedIssue.status !== "in_progress" && (
                <button className="btn-warning" disabled={actionLoading} onClick={() => handleStatusUpdate(selectedIssue._id, "in_progress")}>
                  🔧 Mark In Progress
                </button>
              )}
              {selectedIssue.status !== "resolved" && (
                <button className="btn-success" disabled={actionLoading} onClick={() => handleStatusUpdate(selectedIssue._id, "resolved")}>
                  ✅ Mark Resolved
                </button>
              )}
              {selectedIssue.status !== "rejected" && (
                <button className="btn-danger" disabled={actionLoading} onClick={() => handleStatusUpdate(selectedIssue._id, "rejected")}>
                  ❌ Reject
                </button>
              )}
              <button className="btn-danger" style={{ marginLeft: "auto" }} disabled={actionLoading} onClick={() => handleDelete(selectedIssue._id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;