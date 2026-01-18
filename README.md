# General Store Management System

A full-stack web application for managing retail and wholesale general store operations.

## Features
- **Dashboard**: Real-time sales stats, low stock alerts, expiry tracking.
- **Product Management**: CRUD, barcode support, expiry date tracking (Traffic light system).
- **Sales Point (POS)**: Retail & Wholesale modes, atomic stock updates, cart management.
- **Customer Management**: Wholesale customer tracking and balance management.
- **Authentication**: Secure Admin/Staff login with JWT.

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons, Recharts, Sonner (Toast).
- **Backend**: Node.js, Express, Prisma (SQLite), Zod, JWT.

## Prerequisites
- Node.js (v18+)
- npm

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
# Initialize Database
npx prisma migrate dev --name init
# Seed Admin User
npx prisma db seed
# Start Server
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
# Start Dev Server
npm run dev
```
Frontend runs on `http://localhost:3000`.

## Default Credentials
- **Email**: `admin@store.com`
- **Password**: `admin123`

## Directory Structure
- `/backend`: API and Database logic.
- `/frontend`: Next.js UI Application.

## Notes
- Database is SQLite (`dev.db` in `backend/prisma`).
- API URL is configured in `frontend/src/lib/api.ts`.
