import React from "react";

const LoadingSpinner = ({ fullPage = false, text = "Loading..." }) => {
  if (fullPage) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "40vh", gap: "16px"
      }}>
        <div className="spinner" />
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{text}</p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }} />
      <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>{text}</span>
    </div>
  );
};

export default LoadingSpinner;
