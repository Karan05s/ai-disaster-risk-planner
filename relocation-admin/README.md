# Relocation Admin Panel

Admin panel for the Smart India Hackathon 2026 Disaster Risk Relocation Planning System.

## Quick Start

```bash
cd relocation-admin
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@relocation.gov | admin123 |
| Viewer | viewer@relocation.gov | viewer123 |

**Note:** Viewer accounts are blocked from accessing the admin screens (Queue, Decision Detail, Audit Log) — they will see an "Access Denied" page after login.

## Project Structure

```
src/
├── api/
│   └── client.js          # Data layer — mock implementations with Promise-based API
├── screens/
│   ├── LoginScreen.jsx
│   ├── QueueScreen.jsx
│   ├── DecisionDetailScreen.jsx
│   ├── AuditLogScreen.jsx
│   └── AccessDeniedScreen.jsx
├── components/
│   ├── Badges.jsx         # Risk/Priority/Status badges
│   ├── DecisionCard.jsx   # Decision card for queue
│   └── Layout.jsx         # Main layout with navigation
├── context/
│   └── AuthContext.jsx    # Auth state + login/logout/role checks
├── App.jsx                # Routing + protected routes
├── main.jsx               # Entry point
└── index.css              # Utility CSS (no Tailwind dependency)
```

## Features (Dummy Data Phase)

- **Login** with role-based access (ADMIN/AUTHORITY vs VIEWER)
- **Decision Queue** with filtering (status, risk level, priority, district)
- **Decision Detail/Review** — view village context, site capacity, approve/override actions
- **Audit Log** — read-only table with expandable before/after state
- Loading, empty, and error states on every screen
- Simulated network latency and error injection for testing

## Swapping in the Real API

When the backend (Spring Boot + PostgreSQL/PostGIS) is ready, **only `src/api/client.js` needs to change**.

### Current Contract (functions exported from `src/api/client.js`)

```js
login(email, password)                    -> { token, user: {id, name, email, role} }
getCurrentUser(token)                     -> { id, name, email, role }
getDecisions()                            -> [DecisionSummary]
getDecisionById(id)                       -> DecisionDetail
approveDecision(id)                       -> DecisionDetail
overrideDecision(id, { siteId, overrideReason }) -> DecisionDetail
getVillageById(id)                        -> VillageDetail
getSiteCapacity(id)                       -> { id, name, capacityTotal, capacityUsed }
getAuditLogs()                            -> [AuditLogEntry]
```

### Migration Steps

1. Replace the mock implementations in `src/api/client.js` with real `fetch`/`axios` calls to Purwansh's REST endpoints.
2. Keep **function signatures and return shapes identical** — no component changes required.
3. Remove the `delay()` helper and `setSimulateError` toggle.
4. Update the base URL / auth header handling as needed.
5. The in-memory `DECISIONS` array mutation in `approveDecision`/`overrideDecision` should be removed — the real API will persist changes.

### Notes for Backend Integration

- `decidedBy` and `decidedAt` are **never sent in requests** — they are set server-side and returned in responses.
- `overrideReason` is mandatory — the UI blocks submission if empty; the API should validate this too.
- The audit log `beforeState`/`afterState` shape is **provisional** — confirm with Purwansh before finalizing.
- All functions already return `Promise` — the swap is a pure internal implementation change.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Tech Stack

- React 18 + Vite
- React Router v6
- Plain CSS (utility classes, no Tailwind)
- Zero backend in this phase — pure client-side mock data layer