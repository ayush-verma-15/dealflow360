# DealFlow360

DealFlow360 is a MERN sales operations platform for quotations, discount governance, approvals, fulfillment, billing, customer negotiation, notifications, and deal health.

## Stack

- Frontend: React, Vite, React Router, TanStack Query, Axios, Material UI, Recharts
- Backend: Node.js, Express, Mongoose, MongoDB, JWT, bcrypt, Socket.IO
- Testing: Jest
- Deployment: Docker Compose with MongoDB, backend, and Nginx-served frontend

## Architecture

`frontend` contains the React application. `backend` contains Express routes, controllers, Mongoose models, middleware, and business utilities. Backend pricing, totals, risk, approval, fulfillment, billing, proration, and customer authorization are authoritative.

## Local Setup

Prerequisites: Node.js 20+, MongoDB running on `mongodb://localhost:27017`.

```powershell
Copy-Item .env.example .env
npm run install:all
npm run test
npm run build
```

Start services in separate terminals:

```powershell
npm run dev:backend
npm run dev:frontend
```

Open `http://localhost:3000` or the next available Vite port. API health is available at `/api/health`.

## Environment

See [.env.example](.env.example): `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CLIENT_URL`, and `CORS_ORIGIN`.

## Seed Data

`npm --prefix backend run seed:demo` safely adds demo products and warehouses. `npm --prefix backend run seed:reset` recreates the complete demo catalog and users. Demo password: `Test@123`.

Demo accounts:

| Role | Email |
| --- | --- |
| Sales rep | ayush@dealflow.com |
| Sales manager | manager@dealflow.com |
| Finance | finance@dealflow.com |
| Admin | admin@dealflow.com |
| Customer | acme@dealflow.com |

## Docker

```powershell
docker compose -f docker/docker-compose.yml up --build
```

Services expose frontend on `3000`, backend on `5000`, and MongoDB on `27017`.

## API Areas

- `/api/auth`: authentication, users, customers, RBAC
- `/api/products`: catalog, stock, recommendations, upsell rules
- `/api/quotes`: quotations, totals, risk, approvals, negotiation
- `/api/warehouses`: allocation, inventory, stock movements
- `/api/billing`: invoices, payments, subscriptions, proration
- `/api/deal-health`: stalled deals, anomalies, delivery risk
- `/api/notifications`: unread and read notification workflows
- `/api/reports`: sales reporting

## Security Model

JWT authentication is required for protected routes. Authorization is enforced server-side by role. Customer quotation queries are scoped to the authenticated customer, and customer responses omit internal risk, margin, approval, and audit fields. Passwords are bcrypt-hashed and secrets are environment variables.

## Verification

```powershell
npm test
npm run build
npm --prefix frontend run typecheck
```

## Known Limitations

- PDF/CSV export and configurable admin screens are still incremental follow-up work.
- Socket events are currently room-based and do not yet authenticate socket handshakes.
- Docker must be installed locally to run the Compose stack.
