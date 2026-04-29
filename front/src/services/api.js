const BASE = "http://localhost:3050/api/v1";

const getHeaders = () => {
  const token = localStorage.getItem("civix_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Issues ──────────────────────────────────────────────────────────────────
export const issueAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined))
    ).toString();
    return fetch(`${BASE}/issues${qs ? `?${qs}` : ""}`, { headers: getHeaders() }).then(handleRes);
  },
  getById: (id) =>
    fetch(`${BASE}/issues/${id}`, { headers: getHeaders() }).then(handleRes),
  getStats: (pincode) =>
    fetch(`${BASE}/issues/stats${pincode ? `?pincode=${pincode}` : ""}`, { headers: getHeaders() }).then(handleRes),
  create: (formData) =>
    fetch(`${BASE}/issues`, {
      method: "POST",
      headers: { ...(localStorage.getItem("civix_token") ? { Authorization: `Bearer ${localStorage.getItem("civix_token")}` } : {}) },
      body: formData, // FormData — do NOT set Content-Type (browser sets multipart boundary)
    }).then(handleRes),
  updateStatus: (id, status, comment = "") =>
    fetch(`${BASE}/issues/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status, comment }),
    }).then(handleRes),
  addComment: (id, text) =>
    fetch(`${BASE}/issues/${id}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    }).then(handleRes),
  delete: (id) =>
    fetch(`${BASE}/issues/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleRes),
};

// ── Authority ────────────────────────────────────────────────────────────────
export const authorityAPI = {
  signup: (data) =>
    fetch(`${BASE}/authority/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleRes),
  login: (data) =>
    fetch(`${BASE}/authority/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleRes),
  me: () =>
    fetch(`${BASE}/authority/me`, { headers: getHeaders() }).then(handleRes),
};

// ── Helper ───────────────────────────────────────────────────────────────────
async function handleRes(res) {
  const data = await res.json().catch(() => ({ message: "Unknown error" }));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}
