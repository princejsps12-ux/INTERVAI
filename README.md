<div align="center">

```
██╗███╗   ██╗████████╗███████╗██████╗ ██╗   ██╗ █████╗ ██╗
██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗██║   ██║██╔══██╗██║
██║██╔██╗ ██║   ██║   █████╗  ██████╔╝██║   ██║███████║██║
██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══██║██║
██║██║ ╚████║   ██║   ███████╗██║  ██║ ╚████╔╝ ██║  ██║██║
╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚═╝
```

**AI-Powered Mock Interview Platform**

*Practice with a real-time AI interviewer. Get scored on accuracy, clarity, depth, and confidence. Land the job.*

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)

</div>

---

## Features

| | Feature | Description |
|---|---|---|
| 🎙️ | **AI Voice Interviewer** | Speaks, listens, and adapts with intelligent follow-ups — just like a real interviewer |
| 📊 | **Real-time Scoring** | Instant breakdown across accuracy, clarity, depth, and confidence after every answer |
| 🗃️ | **2M+ Question Bank** | FAANG behavioral, system design, DSA, and domain-specific questions — hand curated |
| 🏢 | **Company-Specific Prep** | Tailored question sets for Google, Amazon, Microsoft, and 200+ companies |
| 📈 | **Performance Analytics** | Track streaks, improvement trends, and weak spots across all your sessions |
| 🎬 | **Full Mock Rounds** | End-to-end timed simulations with multiple rounds and a final hiring decision score |
| 📄 | **Resume Screener** | AI reviews your resume against JDs and generates targeted questions from your profile |
| 🔊 | **Voice & Tone Analysis** | Detects hesitation, filler words, pacing, and tonal confidence |
| 🏆 | **Leaderboards & Streaks** | Daily streaks, peer rankings, and recruiter-ready certificates |

---

## Tech Stack

### Monorepo Layout

```
intervai/
├── apps/
│   ├── web/          # Next.js 14 frontend        → localhost:3000
│   └── api/          # Express REST API            → localhost:4000
└── packages/
    └── database/     # Prisma schema + client (shared between apps)
```

### Frontend — `apps/web`

| Technology | Role |
|---|---|
| Next.js 14 (App Router) | Framework, SSR, routing |
| TypeScript 5 | Type safety across the entire app |
| Tailwind CSS 3 | Utility-first styling with custom design tokens |
| Framer Motion | Page and component animations |
| Three.js | 3D wireframe sphere on the hero |
| NextAuth v4 | Authentication — Google OAuth |
| Radix UI | Accessible component primitives (dialog, toast, select…) |
| React Hook Form + Zod | Form handling and validation |
| Lenis | Smooth scrolling |
| Orbitron / Rajdhani | Custom Google Fonts |

### Backend — `apps/api`

| Technology | Role |
|---|---|
| Express 4 | REST API server |
| TypeScript 5 + tsx | Type-safe dev runtime with watch mode |
| Prisma 5 | ORM, query builder, migrations |
| PostgreSQL | Primary relational database |
| Helmet | Security headers |
| express-rate-limit | API rate limiting |
| Morgan | HTTP request logging |
| Zod | Request body validation |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18 and **npm** >= 9
- **PostgreSQL** 14+ running locally (or a remote URL)
- A **Google Cloud** project with OAuth 2.0 credentials
- An **OpenAI** API key

### 1. Clone & install

```bash
git clone https://github.com/your-org/intervai.git
cd intervai
npm install
```

### 2. Configure environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Open `apps/web/.env.local` and fill in your values:

```env
# ── App ─────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000

# ── NextAuth ─────────────────────────────────────────────────
# Generate: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# ── Google OAuth ─────────────────────────────────────────────
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ── Database ─────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/intervai

# ── OpenAI ───────────────────────────────────────────────────
OPENAI_API_KEY=sk-your-key

# ── Stripe (payments) ────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── Resend (email) ───────────────────────────────────────────
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@intervai.in

# ── Cloudinary (optional storage) ────────────────────────────
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Set up the database

```bash
# Run migrations (creates all tables)
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 4. Start development

```bash
npm run dev
```

| Service | URL |
|---|---|
| Web App | http://localhost:3000 |
| API Server | http://localhost:4000 |
| Prisma Studio | http://localhost:5555 &nbsp;*(run `npm run db:studio`)* |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start web + API concurrently |
| `npm run dev:web` | Start Next.js only |
| `npm run dev:api` | Start Express API only |
| `npm run build` | Production build for all apps |
| `npm run build:web` | Build Next.js app |
| `npm run build:api` | Compile Express API to JS |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Run pending database migrations |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:seed` | Seed the database with demo data |
| `npm run lint` | Lint all workspaces |
| `npm run type-check` | TypeScript check across all workspaces |

---

## Database Schema

```
User
 ├── plan: FREE | PRO | ENTERPRISE
 ├── streak: Int
 ├── InterviewSession[]
 │    ├── type: BEHAVIORAL | TECHNICAL | SYSTEM_DESIGN | MIXED
 │    ├── difficulty: EASY | MEDIUM | HARD
 │    └── Question[]
 │         └── Evaluation  (scores + AI narrative)
 └── Subscription
      └── status: ACTIVE | TRIALING | CANCELED | PAST_DUE
```

---

## App Pages

```
/                      Landing page
/auth/signin           Sign in with Google
/auth/signup           Create account
/dashboard             Analytics dashboard & session history
/dashboard/dsa         DSA practice tracker
/interview/session     Live AI interview session
/interview/error       Session error handler
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/users/me` | Get current user profile |
| `PATCH` | `/users/me` | Update profile |
| `GET` | `/interviews` | List all sessions for user |
| `POST` | `/interviews` | Create a new interview session |
| `GET` | `/interviews/:id` | Get session with questions |
| `POST` | `/evaluations` | Submit answer for AI evaluation |
| `GET` | `/evaluations/:id` | Get evaluation result |

---

## Pricing

| Plan | Price | Who it's for |
|---|---|---|
| **Free** | ₹0 / forever | 5 sessions/month · text only · basic scoring |
| **Pro** | ₹299 / month | Unlimited sessions · AI voice · all features · 7-day free trial |
| **College** | ₹50 / student / month | Bulk prep for institutions · admin dashboard · white-label · min. 50 students |

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Background | `#020408` | Body, root, all section backgrounds |
| Accent (Cyan) | `#00ffc8` | Buttons, borders, glows, highlights |
| Text Primary | `#ffffff` | Headings, body copy |
| Text Muted | `rgba(255,255,255,0.45)` | Secondary labels |
| Font — Heading | Orbitron (700, 900) | All `h1`–`h6` elements |
| Font — Body | Rajdhani (300, 400, 600) | Paragraphs, UI labels |

**Visual effects:** NeuralCanvas animated particle field · Three.js wireframe icosahedron · scan-line animation · HUD corner decorators · glassmorphism cards

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes and run checks:
   ```bash
   npm run lint && npm run type-check
   ```
3. Commit with a clear message: `git commit -m "feat: describe your change"`
4. Open a pull request — describe what you changed and why

---

## License

MIT © IntervAI
