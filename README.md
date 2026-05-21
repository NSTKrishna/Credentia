# Credentia - Background Verification Platform

Credentia is a modern, full-stack web application designed for running comprehensive background verifications (BGV) on candidates. It features an automated verification pipeline for Aadhaar and PAN cards, a robust backend with mocked integration APIs, and a sleek frontend dashboard.

## Features
- **Authentication**: JWT-based authentication with secure login and registration.
- **Candidate Management**: Complete CRUD operations for candidates.
- **Automated Verifications**: Parallel mock verification workflows for Aadhaar (UIDAI) and PAN (NSDL).
- **Interactive UI**: Live animated verification timelines and real-time status updates.
- **PDF Reports**: Automated, downloadable PDF verification reports using Puppeteer.
- **Security**: Rate limiting, Helmet, CORS, input sanitization, and request tracing.
- **Testing**: Comprehensive Jest test suite for both backend and frontend components.

## Tech Stack
### Backend
- **Node.js & Express**: Core API server
- **TypeScript**: Static typing
- **Prisma & SQLite**: Database ORM
- **Jest & Supertest**: Testing infrastructure
- **Puppeteer**: PDF generation
- **Zod**: Input validation

### Frontend
- **Next.js (React)**: App router framework
- **Tailwind CSS**: Styling and utility classes
- **React Hook Form**: Form state management
- **Zod**: Client-side validation
- **React Testing Library**: UI testing
- **Lucide React**: Iconography

## Local Setup

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.

### 2. Backend Setup
```bash
cd backend
npm install

# Setup environment variables (copy from .env.example if available, or create one)
cat <<EOT > .env
PORT=5001
JWT_SECRET=super_secret_jwt_key_123
DATABASE_URL="file:./dev.db"
EOT

# Run database migrations
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5001`.

## Environment Variables

| Variable       | Description                                  | Default               |
|----------------|----------------------------------------------|-----------------------|
| `PORT`         | Port for the backend API server              | `5001`                |
| `JWT_SECRET`   | Secret key for signing JWT tokens            | (Required)            |
| `DATABASE_URL` | SQLite database connection string            | `file:./dev.db`       |
| `NODE_ENV`     | Environment mode (`development` or `test`)   | `development`         |

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/candidates` | List all candidates | Yes |
| POST | `/api/candidates` | Create a candidate | Yes |
| GET | `/api/candidates/:id` | Get candidate details | Yes |
| PUT | `/api/candidates/:id` | Update a candidate | Yes |
| DELETE | `/api/candidates/:id` | Delete a candidate | Yes |
| POST | `/api/verifications/:id/start` | Start verification flow | Yes |
| GET | `/api/reports` | List all reports | Yes |
| POST | `/api/reports/:candidateId/generate` | Generate PDF report | Yes |
| GET | `/api/reports/:candidateId/download` | Download PDF report | Yes |
| GET | `/api/dashboard/stats` | Get dashboard overview stats | Yes |
| GET | `/api/dashboard/recent-candidates` | Get recent candidates | Yes |

## Screenshots

*Note: The following paths are placeholders for screenshots you can capture.*
- `![Dashboard](docs/dashboard.png)`
- `![Candidate Detail](docs/candidate-detail.png)`
- `![Verification Progress](docs/verification-progress.png)`
- `![PDF Report](docs/pdf-report.png)`

## Live Demo
*A live demo link can be inserted here if deployed to Vercel/Render.*
