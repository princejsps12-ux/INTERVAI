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

*Practice with a real-time AI interviewer that speaks to you, listens to your voice answers, watches your posture, and scores you on accuracy, clarity, depth, and confidence.*

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036?style=flat-square)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose%20Landmarker-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🤖 | **AI question generation** | Five tailored questions per session based on role, type, difficulty, and company |
| 🗣 | **Voice interviewer** | Browser TTS speaks every question aloud with replay & mute controls |
| 🎤 | **Voice answers** | Record with your mic — Whisper transcribes to text automatically |
| 📹 | **Live posture coach** | MediaPipe pose detection runs locally in your browser, gives real-time feedback on visibility, centering, lighting, and posture |
| 📊 | **AI evaluation** | Each answer scored on accuracy, clarity, depth, confidence, and overall — with feedback and concrete improvement suggestions |
| 🔥 | **Streaks & analytics** | Track total interviews, average score, best score, daily streak, and per-question breakdown with radar charts |
| 🎨 | **Neural Grid theme** | Dark cyberpunk UI with glowing borders, particle backgrounds, glassmorphism, Orbitron + Rajdhani fonts |
| 🔐 | **JWT auth** | Bcrypt password hashing, JWT tokens stored in localStorage, axios interceptor for auto-attach |

---

## 🏗 Architecture

```
INTERVAI/
├── backend/                  Express + TypeScript API
│   ├── src/
│   │   ├── index.ts          App entry — middleware, routes, server
│   │   ├── middleware/
│   │   │   ├── auth.ts       JWT verification (Authorization: Bearer)
│   │   │   ├── errorHandler.ts
│   │   │   └── notFound.ts
│   │   ├── routes/
│   │   │   ├── auth.ts       POST /register, /login | GET /me
│   │   │   ├── interviews.ts GET, POST /, GET /:id, PATCH /:id/answer
│   │   │   ├── evaluations.ts GET /:id, GET /session/:sessionId
│   │   │   ├── users.ts      GET, PATCH /profile
│   │   │   └── audio.ts      POST /transcribe (multipart)
│   │   └── services/
│   │       ├── openai.service.ts  Question generation + answer evaluation (LLM)
│   │       └── audio.service.ts   Whisper transcription
│   └── .env.example
├── frontend/                 Next.js 14 (App Router) + Tailwind + Shadcn
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login, register
│   │   │   ├── (dashboard)/dashboard, interview/new, interview/[id], interview/[id]/results, profile, history
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx      Landing page
│   │   ├── components/
│   │   │   ├── ui/           Shadcn primitives (Button, Card, Progress, Dialog, …)
│   │   │   ├── layout/       Navbar, Sidebar, ParticleCanvas
│   │   │   └── interview/    CameraMonitor (live posture coach)
│   │   └── lib/
│   │       ├── api.ts        Axios instance + JWT interceptor
│   │       ├── auth.tsx      AuthContext provider
│   │       └── hooks/        useInterviews, useAuth (React Query)
│   └── .env.local.example
└── packages/database/        Shared Prisma client
    ├── prisma/schema.prisma  User, InterviewSession, Question, Answer, Evaluation, Subscription
    └── src/index.ts          Prisma client singleton
```

---

## 🧠 AI Stack

InterVAI is **provider-agnostic** — it speaks the OpenAI Chat Completions protocol, so it works with any compatible endpoint. The default config points at **Groq** (free tier, no credit card) for both LLM and Whisper.

| Job | Default | Model |
|---|---|---|
| Question generation | Groq | `llama-3.3-70b-versatile` |
| Answer evaluation | Groq | `llama-3.3-70b-versatile` |
| Speech-to-text | Groq Whisper | `whisper-large-v3` |
| Text-to-speech | Browser native | `window.speechSynthesis` (free, offline) |
| Posture / visibility | MediaPipe | `pose_landmarker_lite.task` (runs in browser) |

To switch to OpenAI, Anthropic, or any other provider — just edit three env vars in `backend/.env`:

```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1   # or remove for default
OPENAI_MODEL=gpt-4o
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+**
- **PostgreSQL 14+** running locally (or any Postgres URL — Neon, Supabase, Railway all work)
- A **Groq API key** (free, get at [console.groq.com/keys](https://console.groq.com/keys))

### 1. Clone & install

```bash
git clone https://github.com/princejsps12-ux/INTERVAI.git
cd INTERVAI
npm install
```

### 2. Set up environment files

**`backend/.env`**

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/intervai

JWT_SECRET=change-me-to-something-long-and-random
JWT_EXPIRES_IN=7d

# Groq (free tier — drop-in OpenAI replacement)
OPENAI_API_KEY=gsk_your_groq_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
OPENAI_AUDIO_MODEL=whisper-large-v3
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**`packages/database/.env`** (Prisma reads this for migrations)

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/intervai
```

> 💡 If your Postgres password contains special characters (like `@`), URL-encode them. `@` becomes `%40`, `:` becomes `%3A`, etc.

### 3. Create the database & run migrations

```bash
# Create the database (one-time)
psql -U postgres -c "CREATE DATABASE intervai;"

# Apply schema
cd packages/database
npx prisma migrate dev --name init
cd ../..
```

### 4. Run both servers

```bash
npm run dev
```

This boots both servers concurrently:

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3001 |
| Backend (Express) | http://localhost:4000 |
| Health check | http://localhost:4000/health |

### 5. Try it

1. Open **http://localhost:3001** → click **Start Free**
2. Register an account
3. Click **Start New Interview** → pick Behavioral / Easy / "Software Engineer"
4. Allow camera + mic permissions when prompted
5. The AI speaks the question, you record your answer, AI scores it

---

## 🔌 API Reference

All responses follow `{ success: boolean, data?: any, message?: string }`.

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | Create account, returns `{ user, token }` |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ user, token }` |
| GET | `/api/auth/me` | — | Current user (requires `Authorization: Bearer <token>`) |

### Interviews

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/interviews` | List user's sessions (with questions) |
| POST | `/api/interviews` | Body: `{ company?, role, type, difficulty }` — generates 5 questions via LLM |
| GET | `/api/interviews/:id` | Single session with questions, answers, evaluations |
| PATCH | `/api/interviews/:id/answer` | Body: `{ questionId, text?, audioUrl?, timeTaken }` — saves answer + AI evaluation |

### Evaluations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/evaluations/:id` | Single evaluation |
| GET | `/api/evaluations/session/:sessionId` | All evaluations for a session with aggregated scores |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/profile` | Profile + subscription + streak + total sessions + average score |
| PATCH | `/api/users/profile` | Body: `{ name?, image? }` |

### Audio

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/audio/transcribe` | `multipart/form-data` with field `audio` — returns `{ text }` |

---

## 🗄 Database Schema

Six core models (see [`packages/database/prisma/schema.prisma`](./packages/database/prisma/schema.prisma)):

```
User ──┬─< InterviewSession ──< Question ──< Answer ──── Evaluation
       └─< Subscription
```

- **User** — id, name, email, passwordHash, image, plan, streak
- **InterviewSession** — id, userId, company?, role, type, difficulty, duration
- **Question** — id, sessionId, text, type, difficulty, orderIndex
- **Answer** — id, questionId, text?, audioUrl?, timeTaken
- **Evaluation** — id, answerId, accuracyScore, clarityScore, depthScore, confidenceScore, overallScore, feedback, suggestions[]
- **Subscription** — id, userId, plan (FREE/PRO/ENTERPRISE), status, expiresAt

Enums: `InterviewType` (BEHAVIORAL, TECHNICAL, SYSTEM_DESIGN, MIXED), `Difficulty` (EASY, MEDIUM, HARD), `Plan`, `SubscriptionStatus`.

---

## 🎙 Voice & Vision Implementation Notes

### Text-to-Speech (questions)
- Pure browser API: `window.speechSynthesis` + `SpeechSynthesisUtterance`
- Picks a US English voice (preferring female names like Samantha/Zira/Aria)
- Auto-plays on question mount; cancelled on recording start to prevent feedback loop
- Replay & mute toggles on the question card

### Speech-to-Text (answers)
- `MediaRecorder` captures `audio/webm` from `getUserMedia({ audio: true })`
- Posted as multipart to `/api/audio/transcribe`
- Backend uses the OpenAI SDK pointed at Groq's `whisper-large-v3`
- Transcript appended to the answer textarea — user can edit before submitting

### Live posture coach
- `@mediapipe/tasks-vision` `PoseLandmarker` (lite model, ~6 MB, GPU-delegated)
- 33 keypoints per frame, ~30fps, throttled React updates to 3 Hz
- Heuristics:
  - **Visibility** — body keypoints detected at all
  - **Centering** — nose `x` between 0.3 and 0.7
  - **Distance** — shoulder width 0.2–0.65 of frame
  - **Posture** — shoulder Δy < 0.06, eye Δy < 0.04, nose well above shoulders
  - **Lighting** — Rec.601 luminance sampled on a 64×48 canvas (target 55–220)
- **All processing stays in the browser** — no frames ever leave the client

---

## 🎨 Design System — Neural Grid

| Token | Value |
|---|---|
| `--neural-bg` | `#0a0a0f` |
| `--neural-cyan` | `#00f5ff` |
| `--neural-purple` | `#7c3aed` |
| `--neural-surface` | `#111118` |
| `--neural-border` | `#1e1e2e` |
| `--neural-text-primary` | `#e2e8f0` |
| `--neural-text-muted` | `#64748b` |
| Heading font | **Orbitron** |
| Body font | **Rajdhani** |

Visual language: glowing borders on focus, particle canvas backgrounds on auth/landing, glassmorphism cards, framer-motion entrance animations.

---

## 📜 Scripts

From the repo root:

```bash
npm run dev          # Both servers concurrently
npm run dev:api      # Backend only (tsx watch)
npm run dev:web      # Frontend only (next dev)
npm run build        # Build both
```

In `packages/database/`:

```bash
npx prisma migrate dev    # Create new migration from schema changes
npx prisma migrate deploy # Apply pending migrations (production)
npx prisma studio         # Visual DB explorer
npx prisma generate       # Regenerate Prisma client
```

---

## ☁️ Deployment

InterVAI is designed to deploy as **two separate services**:

| Service | Recommended platform | Why |
|---|---|---|
| Frontend (Next.js) | **Vercel** | Auto-detects Next.js, free hobby tier, optimized CDN |
| Backend (Express + Prisma) | **Render** | Free web service + free Postgres in one place, native Node support |
| Database (Postgres) | **Render** (or Neon/Supabase) | Free tier included with Render |

### 1️⃣ Deploy backend on Render

The repo includes a `render.yaml` blueprint — Render reads it automatically.

1. Sign up at [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub and select `princejsps12-ux/INTERVAI`
3. Render will create:
   - A **PostgreSQL database** (`intervai-db`, free tier)
   - A **Web Service** (`intervai-backend`) wired to that database
   - `JWT_SECRET` is auto-generated, `DATABASE_URL` is auto-injected
4. Set the two `sync: false` env vars manually in the dashboard:
   - `OPENAI_API_KEY` → your Groq key (`gsk_…`)
   - `CORS_ORIGIN` → leave blank for now (you'll set it after the Vercel deploy)
5. First deploy runs `npm install && npm run build --workspace=backend` (which generates the Prisma client), then `npm run start:migrate --workspace=backend` (which applies migrations + starts the server)
6. When it's live, copy the URL — something like `https://intervai-backend.onrender.com`

> 💤 The free Render plan **sleeps after 15 minutes of inactivity** (cold start ~30 seconds on first request). Upgrade to Starter ($7/mo) to keep it always-on.

### 2️⃣ Deploy frontend on Vercel

1. Sign up at [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import the same `princejsps12-ux/INTERVAI` repo
3. **Important monorepo settings:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (auto-detected)
   - The included `frontend/vercel.json` handles install/build for the workspace
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` → your Render backend URL (e.g. `https://intervai-backend.onrender.com`)
5. Deploy. Vercel gives you a URL like `https://intervai.vercel.app`

### 3️⃣ Wire CORS (final step)

Back in Render → your `intervai-backend` service → Environment:

- Set `CORS_ORIGIN` = `https://intervai.vercel.app` (your actual Vercel URL)
- If you have a preview branch deploys, use comma-separated values: `https://intervai.vercel.app,https://intervai-git-main-yourname.vercel.app`

Render will auto-redeploy with the new CORS config.

### ✅ Smoke test

```bash
# Backend health
curl https://intervai-backend.onrender.com/health
# → {"status":"ok",...}

# Frontend loads
open https://intervai.vercel.app

# Try register/login → start interview → record voice → live posture coach
```

### Production env vars cheat-sheet

**Render (backend):**

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render injects this) |
| `DATABASE_URL` | auto from `intervai-db` |
| `JWT_SECRET` | auto-generated |
| `JWT_EXPIRES_IN` | `7d` |
| `OPENAI_API_KEY` | your Groq key |
| `OPENAI_BASE_URL` | `https://api.groq.com/openai/v1` |
| `OPENAI_MODEL` | `llama-3.3-70b-versatile` |
| `OPENAI_AUDIO_MODEL` | `whisper-large-v3` |
| `CORS_ORIGIN` | your Vercel URL(s), comma-separated |

**Vercel (frontend):**

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | your Render backend URL |

---

## 🐞 Troubleshooting

| Symptom | Fix |
|---|---|
| `401 invalid_api_key` toast on Start Interview | Your Groq key in `backend/.env` is wrong or expired. Get a new one at [console.groq.com/keys](https://console.groq.com/keys) |
| Backend won't connect to DB | URL-encode special chars in your password. `@` → `%40` |
| Camera box stays loading | First load downloads MediaPipe WASM + model (~6 MB) from Google CDN — needs internet |
| "Microphone access denied" alert | Browser blocked mic. Click the lock icon in the URL bar → Allow microphone |
| Port 3001 already in use | Edit `frontend/package.json` `dev` script to use a different port, or stop the other process |
| `Environment variable not found: DATABASE_URL` from Prisma | Prisma reads from `packages/database/.env` for migrations — create that file too |
| Vercel build fails with "command not found" | Make sure **Root Directory** is set to `frontend` in Vercel project settings |
| Render build fails on `prisma generate` | Make sure `DATABASE_URL` is set as an env var (or use the blueprint, which wires it automatically) |
| Frontend can't reach backend in production | Check `CORS_ORIGIN` on Render includes your exact Vercel URL (with `https://`, no trailing slash); check `NEXT_PUBLIC_API_URL` on Vercel matches the Render URL |
| Backend on Render takes 30s on first request | That's the free-tier cold start — upgrade to Starter to keep it warm, or accept the wait |
| 502 from `/api/audio/transcribe` in production | Check your Groq API key is set in Render's env vars and you have remaining quota |

---

## 🛣 Roadmap

- [ ] Stripe-backed Pro/Enterprise plans
- [ ] Code-interview mode with Monaco editor + test runner sandbox
- [ ] Eye-contact / gaze tracking via FaceLandmarker
- [ ] ElevenLabs TTS for higher-quality interviewer voice (env-toggleable)
- [ ] Shareable interview replays with synced audio + transcript
- [ ] Team accounts with cohort analytics
- [ ] Mobile-friendly responsive layout

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

<div align="center">

Built with 🧠 by the InterVAI team. Star ⭐ if it helped you land an interview.

</div>
