# PROJECT_UPGRADE_REPORT.md
# Civix — Smart Civic Issue Reporter
## Full-Stack Upgrade Report

---

## 1. Project Overview

**Project Name:** Civix — Smart Civic Issue Reporter
**Stack:** MERN (MongoDB, Express.js, React.js + Vite, Node.js)
**Purpose:** Enable citizens to report civic infrastructure issues (potholes, garbage, water leakage, broken streetlights, etc.) with photo evidence and location context, routed to the responsible municipal authority by pincode.

**Three Applications:**
| App | Port | Purpose |
|-----|------|---------|
| `back/` | `3050` | REST API backend (Node.js + Express) |
| `front/` | `5174` | Citizen-facing React app |
| `admin/` | `5175` | Authority/municipality dashboard |

---

## 2. Existing Architecture Analysis

### What Existed Before

| Component | State | Issues Found |
|-----------|-------|--------------|
| `server.js` | Monolithic — all routes inline | No controller/route separation, no API versioning, no error handling middleware, no rate limiting |
| `models/user.model.js` | Basic upload schema | No validation, no required fields, weak typing |
| `models/munciplity.js` | Municipality schema | **Passwords stored in plain text**, no bcrypt |
| `controllers/user.controller.js` | Empty file | Completely unused |
| `routes/user.route.js` | Not imported in server.js | Dead code — never registered |
| `config/cloudinary.js` | Working | No image optimization options |
| `config/multer.js` | Working (memory storage) | No file type validation |
| `front/src/App.jsx` | 142 lines commented out | Old code left in comments |
| `front/src/pages/Users.jsx` | Basic form | Raw `alert()` for feedback, no UX design |
| `front/src/pages/Munciplity.jsx` | Login form | Stored token without JWT validation |
| `admin/src/App.jsx` | Works but `admin/` route hidden behind obscure URL `/onlyforadminakjfdbk` | Security by obscurity |
| `admin/src/pages/Admin.jsx` | Working dashboard | No auth protection, `allow()` function just called `alert()` with no DB update |
| `admin/src/pages/Issues.jsx` | Empty component | Completely blank |
| `admin/src/pages/Signup.jsx` | Working | Saved passwords in plain text |

### Critical Security Issues Found
1. **Plain-text passwords** in municipality model — no bcrypt
2. **No JWT implementation** on backend — the `/munciplitylogin` route was not implemented at all in `server.js`
3. **No authentication middleware** — admin dashboard accessible without login
4. **CORS wildcard** — `app.use(cors())` with no origin restriction
5. **No rate limiting** — API vulnerable to abuse/brute-force
6. **No input validation** — any data accepted without checks
7. **Admin route hidden by obscure URL** — security by obscurity is not security

---

## 3. Improvements Made

### Backend Improvements

#### New File Structure
```
back/
├── config/
│   ├── cloudinary.js        ✅ unchanged (working)
│   └── multer.js            ✅ unchanged (working)
├── controllers/
│   ├── issue.controller.js  🆕 NEW — full CRUD + stats
│   ├── authority.controller.js 🆕 NEW — signup/login/getMe
│   └── user.controller.js   (preserved, was empty)
├── middleware/
│   ├── auth.js              🆕 NEW — JWT protect middleware
│   ├── errorHandler.js      🆕 NEW — centralized error handler + AppError
│   └── validate.js          🆕 NEW — reusable body validator
├── models/
│   ├── issue.model.js       🆕 NEW — full issue schema
│   ├── authority.model.js   🆕 NEW — with bcrypt hooks
│   ├── user.model.js        ✅ preserved (legacy)
│   └── munciplity.js        ✅ preserved (legacy)
├── routes/
│   ├── issue.route.js       🆕 NEW
│   ├── authority.route.js   🆕 NEW
│   └── user.route.js        ✅ preserved
├── server.js                🔁 REWRITTEN with backward compat
├── .env                     🔁 UPDATED with JWT_SECRET
├── .env.example             🆕 NEW — template for devs
└── package.json             🔁 UPDATED with new dependencies
```

#### New API Endpoints (`/api/v1/`)

**Issues**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`    | `/api/v1/issues`              | Public | List all issues (paginated, filterable) |
| `GET`    | `/api/v1/issues/stats`        | Public | Stats by status and category |
| `GET`    | `/api/v1/issues/:id`          | Public | Get single issue |
| `POST`   | `/api/v1/issues`              | Public | Submit new issue with optional image |
| `PATCH`  | `/api/v1/issues/:id/status`   | 🔒 JWT | Update issue status |
| `POST`   | `/api/v1/issues/:id/comments` | 🔒 JWT | Add authority comment |
| `DELETE` | `/api/v1/issues/:id`          | 🔒 JWT | Delete issue + Cloudinary image |

**Authority**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/authority/signup` | Public | Register municipality |
| `POST` | `/api/v1/authority/login`  | Public | Login, receive JWT |
| `GET`  | `/api/v1/authority/me`     | 🔒 JWT | Get current authority profile |

**Query Parameters for `GET /api/v1/issues`**
- `?pincode=` — filter by area pincode
- `?status=` — filter by status (pending/in_progress/resolved/rejected)
- `?category=` — filter by category
- `?search=` — text search across title, description, address
- `?page=` — page number (default: 1)
- `?limit=` — results per page (default: 10)

#### Consistent Response Format
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## 4. New Features Added

| Feature | Where |
|---------|-------|
| **Issue Categories** | 7 categories: pothole, garbage, water_leakage, streetlight, sewage, road_damage, other |
| **Issue Status Tracking** | 4 states: pending → in_progress → resolved → rejected |
| **Authority Comments** | Authorities can add update notes to any issue |
| **Pagination** | All issue list endpoints paginated |
| **Search** | Full-text search across title, description, address |
| **Filtering** | By pincode, status, category, combined |
| **Geolocation** | Citizens can attach GPS coordinates to reports |
| **Drag & Drop Image Upload** | Improved UX in the report form |
| **Cloudinary image cleanup** | Deleting an issue now also removes its Cloudinary asset |
| **Image optimization** | Auto quality + format transformation on upload |
| **Dashboard Stats** | Total, by-status counts, by-category breakdown |
| **JWT Authentication** | Full bcrypt + JWT auth flow for authorities |
| **Protected Routes** | Admin panel now requires login |
| **Toast Notifications** | Replaced all `alert()` calls with elegant toasts |
| **Landing Page** | Full hero, stats, categories, features sections |

---

## 5. Security Improvements

| Issue | Before | After |
|-------|--------|-------|
| Password storage | Plain text in MongoDB | bcrypt (10 rounds) |
| Authentication | No JWT, no verification | jsonwebtoken with 7-day expiry |
| Auth middleware | None | `protect` middleware verifies Bearer token |
| Route protection | Admin accessible to anyone | `ProtectedRoute` component + JWT guard |
| Rate limiting | None | 200 req/15min global; 20 uploads/hour |
| Input validation | None | `validate` middleware checks required fields |
| CORS | `cors()` wildcard | Origin whitelist via `CLIENT_ORIGINS` env var |
| Error leakage | Raw errors sent to client | Stack traces only in `NODE_ENV=development` |
| Admin URL | Hidden behind obscure path | Proper `/login` page with credentials |

---

## 6. Performance Improvements

| Improvement | Details |
|-------------|---------|
| **Pagination** | All list endpoints use `skip/limit`, preventing full collection scans |
| **Database Indexes** | `{ pincode, status }` and `{ createdAt: -1 }` compound indexes on Issue model |
| **Image optimization** | Cloudinary `quality: auto:good` + `fetch_format: auto` (WebP/AVIF auto-selection) |
| **Lazy image loading** | `loading="lazy"` on all issue card images |
| **Promise.all** | Dashboard stats and recent issues fetched in parallel |
| **Memoized callbacks** | `useCallback` on all fetch functions to prevent unnecessary re-renders |

---

## 7. Folder Structure Explanation

### Backend (`back/`)
```
controllers/    Business logic, separated from routing
middleware/     Reusable request interceptors (auth, validation, errors)
models/         Mongoose schemas with validation and hooks
routes/         Express routers — map URLs to controllers
config/         Third-party service configuration (Cloudinary, Multer)
```

### Frontend (`front/`) — Citizen App
```
src/
├── components/      Reusable UI: Navbar, IssueCard, ReportForm, LoadingSpinner
├── contexts/        React contexts: ToastContext (notifications)
├── pages/           Route-level components: Home, BrowseIssues, ReportIssue, AuthorityLogin
├── services/        API abstraction layer (api.js)
├── index.css        Complete design system (tokens, glass cards, buttons, badges)
└── App.jsx          Router configuration
```

### Admin (`admin/`) — Authority Dashboard
```
src/
├── components/      Sidebar navigation
├── contexts/        AuthContext (JWT + localStorage), ToastContext
├── pages/           Login, Dashboard (Admin), Issues, Signup
├── services/        API service layer
└── App.jsx          Router with ProtectedRoute HOC
```

---

## 8. Deployment Readiness Notes

### Environment Variables Required
```env
# back/.env
MONGO_URI=mongodb+srv://...
CLOUD_NAME=your_cloudinary_cloud
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret
JWT_SECRET=a_long_random_secret_string
JWT_EXPIRES_IN=7d
PORT=3050
NODE_ENV=production
CLIENT_ORIGINS=https://your-citizen-app.com,https://your-admin.com
```

### Production Checklist
- [ ] Set `NODE_ENV=production` to suppress stack traces
- [ ] Use a strong random `JWT_SECRET` (32+ characters)
- [ ] Set specific `CLIENT_ORIGINS` (remove localhost)
- [ ] Configure MongoDB Atlas network access
- [ ] Enable Cloudinary upload presets for additional security
- [ ] Add HTTPS/SSL termination at reverse proxy (nginx/Caddy)
- [ ] Consider PM2 or Docker for process management

---

## 9. Future Scope & Recommended Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Email notifications | High | Notify reporter when issue status changes |
| Map view | High | Plot issues on Google Maps / Leaflet by coordinates |
| Image compression | Medium | Client-side compression before upload (browser-image-compression) |
| Push notifications | Medium | Browser push when issue is resolved |
| Export reports | Medium | CSV/PDF export of issues for municipality records |
| Analytics dashboard | Medium | Resolution rate, avg time-to-resolve by category |
| Mobile app | Low | React Native app for easy photo reporting |
| SMS updates | Low | Twilio SMS status updates for reporters |
| AI categorization | Low | Auto-classify issue category from uploaded photo |
| Duplicate detection | Low | Flag issues reported at the same location within 24h |
| Upvoting | Low | Citizens upvote issues to signal priority |
| Multi-language | Low | i18n support for regional languages |

---

## 10. Assumptions Made During Development

1. **Single pincode per authority** — each municipality manages one pincode area. The system filters issues by the authority's pincode on login.
2. **Anonymous reporting is allowed** — reporter name and email are optional fields.
3. **No citizen account system** — citizens don't register; they just submit reports.
4. **The `admin/` app is the authority dashboard** — not a super-admin app. Any registered authority can log in.
5. **Legacy routes must be preserved** — all original endpoints (`/upload`, `/data`, `/delete/:id`, `/munciplitysignup`, `/munciplitylogin`) remain functional for backward compatibility.
6. **Frontend runs on port 5174, Admin on port 5175** — frontend port was already set to 5174 in `vite.config.js`. Admin was on 5174 too (conflict) — changed to 5175.
7. **Cloudinary credentials are valid** — the existing `.env` credentials were preserved; new uploads use optimized transformation settings.

---

## 11. How to Run Locally

### Step 1 — Backend
```bash
cd back
npm install
npm run dev
# API running at http://localhost:3050
```

### Step 2 — Citizen Frontend
```bash
cd front
npm install
npm run dev
# App running at http://localhost:5174
```

### Step 3 — Admin Panel
```bash
cd admin
npm install
npm run dev
# Dashboard at http://localhost:5175
```

### First-Time Setup
1. Start the backend
2. Navigate to `http://localhost:5175/signup`
3. Register the first municipal authority (username, pincode, password)
4. Login at `http://localhost:5175/login`
5. Citizens can now report issues at `http://localhost:5174`

---

*Generated by Civix Upgrade — April 2025*
