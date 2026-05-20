# Credentia

Enterprise Credential Management System.

## Project Structure

This is a monorepo setup containing the backend and frontend for the Credentia application.

- `backend/`: Express + TypeScript + Prisma API
- `frontend/`: Next.js 14 App Router + Tailwind CSS application

## Quick Start

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables and set them up:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Backend**: Express.js, TypeScript, Prisma ORM, Zod, JWT
- **Frontend**: Next.js 14, Tailwind CSS, Zustand, React Hook Form, Lucide React
