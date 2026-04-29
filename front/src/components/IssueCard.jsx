import React from "react";

const STATUS_MAP = {
  pending:     { label: "Pending",     cls: "badge-pending",  icon: "⏳" },
  in_progress: { label: "In Progress", cls: "badge-progress", icon: "🔧" },
  resolved:    { label: "Resolved",    cls: "badge-resolved", icon: "✅" },
  rejected:    { label: "Rejected",    cls: "badge-rejected", icon: "❌" },
};

const CATEGORY_ICONS = {
  pothole:      "🕳️",
  garbage:      "🗑️",
  water_leakage:"💧",
  streetlight:  "💡",
  sewage:       "🚿",
  road_damage:  "🛣️",
  other:        "📋",
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return <span className={`badge ${s.cls}`}>{s.icon} {s.label}</span>;
};

const IssueCard = ({ issue, onClick }) => {
  const cat = (issue.category || "other").replace("_", " ");
  const catIcon = CATEGORY_ICONS[issue.category] || "📋";
  const date = new Date(issue.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

  return (
    <div
      className="glass-card"
      onClick={() => onClick && onClick(issue)}
      style={{ padding: "0", overflow: "hidden", cursor: onClick ? "pointer" : "default" }}
    >
      {/* Image */}
      {issue.imageUrl && (
        <div style={{ height: "180px", overflow: "hidden", position: "relative" }}>
          <img
            src={issue.imageUrl}
            alt={issue.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(6,11,24,0.8) 0%, transparent 50%)"
          }} />
          <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
            <StatusBadge status={issue.status} />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "18px" }}>
        {/* Category + No-image badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span className="cat-badge">{catIcon} {cat}</span>
          {!issue.imageUrl && <StatusBadge status={issue.status} />}
        </div>

        <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px", lineHeight: 1.35 }}>
          {issue.title}
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {issue.description}
        </p>

        <div style={{ display: "flex", gap: "16px", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
          <span>📍 {issue.address}</span>
          <span>📮 {issue.pincode}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>🕐 {date}</span>
          {issue.comments?.length > 0 && (
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>💬 {issue.comments.length} update{issue.comments.length !== 1 ? "s" : ""}</span>
          )}
          {issue.reporterName && issue.reporterName !== "Anonymous" && (
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>👤 {issue.reporterName}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export { StatusBadge, IssueCard };
export default IssueCard;
