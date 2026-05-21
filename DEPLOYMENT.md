# Deployment (Render)

This repo is a full-stack app:
- **Backend**: Node.js + Express + Prisma (Postgres)
- **Frontend**: Next.js

This document lists the required environment variables and a practical Render deployment flow.

## Backend (Render Web Service)

### Service settings
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
- **Start Command**: `node dist/app.js`

### Backend environment variables
Set these in your Render backend service:

- `DATABASE_URL` (required)
  - Postgres connection string (e.g. Neon/Render Postgres)
  - Must be reachable from Render
- `JWT_SECRET` (required)
  - Strong random string
- `NODE_ENV` (recommended)
  - `production`
- `FRONTEND_URL` (required in production)
  - The exact origin of your deployed frontend, e.g. `https://your-frontend.onrender.com`
  - Used by CORS allow-list
- `FRONTEND_URLS` (optional)
  - Comma-separated list of allowed frontend origins (useful if you have multiple frontends)
  - Example: `https://credentia-rho.vercel.app,https://credentia-preview.vercel.app`
- `AADHAAR_API_URL` (required)
  - If using the built-in mock routes, point to your deployed backend:
    - `https://<your-backend-host>/mock-api/aadhaar/verify`
- `PAN_API_URL` (required)
  - If using the built-in mock routes, point to your deployed backend:
    - `https://<your-backend-host>/mock-api/pan/verify`
- `PORT`
  - Render injects this automatically; you typically don’t set it manually

### Health check
- `GET https://<your-backend-host>/health` → `{ "status": "ok", "uptime": <seconds> }`

## Frontend (Render Web Service)

### Service settings
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Frontend environment variables
Set these in your Render frontend service:

- `NEXT_PUBLIC_API_URL` (required)
  - Base URL of the backend **origin only** (no `/api`), e.g. `https://your-backend.onrender.com`
  - The frontend app builds API calls as `${NEXT_PUBLIC_API_URL}/api/...`
  - If this is not set in production, the frontend will call `/api/...` on its own origin (and will fail unless you proxy).

## Post-deploy checklist

- [ ] `GET https://<your-backend-host>/health` → `{ "status": "ok" }`
- [ ] Register a new user
- [ ] Login and receive JWT token
- [ ] Create a candidate
- [ ] Start verification → status updates to `VERIFIED`
- [ ] Generate PDF report → download works
- [ ] Aadhaar masked in all API responses (never shows raw 12 digits)
- [ ] Failed verification test: use Aadhaar starting with `000000`

### Quick verification notes
- Aadhaar mock verification fails when the Aadhaar begins with `000000`.
- PAN mock verification fails when the PAN begins with `AAAAA`.

## Troubleshooting

- **CORS errors**: ensure backend `FRONTEND_URL` exactly matches the deployed frontend origin.
- **Prisma errors**: ensure `DATABASE_URL` points to a Postgres database and `npx prisma migrate deploy` ran successfully.
- **Frontend calls localhost**: ensure `NEXT_PUBLIC_API_URL` is set on the frontend service and redeploy.
