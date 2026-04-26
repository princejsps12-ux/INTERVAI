# IntervAI — AI-Powered Mock Interview Platform

Practice job interviews with realistic AI interviewers and get instant, detailed feedback on accuracy, clarity, depth, and confidence.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, App Router |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | NextAuth.js (Google OAuth + Email) |
| Monorepo | npm Workspaces |

## Project Structure

```
intervai/
├── apps/
│   ├── web/              # Next.js 14 frontend (port 3000)
│   │   ├── app/          # App Router pages & layouts
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # Auth config, utilities
│   │   └── types/        # Shared TypeScript types
│   └── api/              # Express REST API (port 4000)
│       └── src/
│           ├── routes/        # Route handlers
│           ├── controllers/   # Business logic
│           ├── services/      # External integrations
│           └── middleware/    # Auth, error handling, rate limiting
└── packages/
    └── database/         # Prisma schema & client
        ├── prisma/
        │   ├── schema.prisma  # Database models
        │   └── seed.ts        # Seed data
        └── src/
            └── index.ts       # Prisma client export
```

## Getting Started

### 1. Prerequisites

- Node.js >= 18
- PostgreSQL running locally (or a cloud URL)
- npm >= 9

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
# Web app
cp apps/web/.env.example apps/web/.env.local

# API
cp apps/api/.env.example apps/api/.env
```

Fill in the required values (see **Environment Variables** section below).

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (requires DATABASE_URL to be set)
npm run db:migrate

# Optional: seed demo data
npm run db:seed
```

### 5. Start development servers

```bash
# Start both web and API concurrently
npm run dev

# Or individually
npm run dev:web   # http://localhost:3000
npm run dev:api   # http://localhost:4000
```

## Environment Variables

### `apps/web/.env.local`

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL (default: `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `RESEND_API_KEY` | Resend API key for email |

### `apps/api/.env`

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default: `4000`) |
| `DATABASE_URL` | PostgreSQL connection string (same DB) |
| `JWT_SECRET` | JWT signing secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `ELEVENLABS_API_KEY` | ElevenLabs key for voice synthesis |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `RESEND_API_KEY` | Resend API key |

## Database Schema

```
User ──< InterviewSession ──< Question ──── Answer ──── Evaluation
                                                │
                                           (audio/text)
User ──── Subscription
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all services in dev mode |
| `npm run dev:web` | Start Next.js only |
| `npm run dev:api` | Start Express API only |
| `npm run build` | Build all packages |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed demo data |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/auth/me` | Current user |
| GET | `/api/interviews` | List sessions |
| POST | `/api/interviews` | Create session |
| GET | `/api/interviews/:id` | Get session |
| POST | `/api/evaluations` | Submit evaluation |
| GET | `/api/users/profile` | Get profile |
| PATCH | `/api/users/profile` | Update profile |
