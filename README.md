<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Gemini_2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/MediaPipe-0097A7?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

# Prepwise — AI Mock Interviewer

**Prepwise** is a full-stack AI-powered mock interview platform that conducts real, voice-based interviews tailored to your role. It uses **Gemini 2.0 Flash** for conversational AI, **Google Cloud TTS** for natural speech output, the **Web Speech API** for voice input, and **MediaPipe** for real-time body language analysis — all running in the browser.

---

## Features

- **Voice-based AI interviews** — the AI interviewer speaks questions aloud and listens to your spoken answers
- **Dynamic follow-up questions** — AI adapts based on your actual response (not pre-set scripts)
- **Real-time body language analysis** — MediaPipe tracks eye contact, posture, and facial expression via webcam
- **Live speech-to-text** — see your words transcribed in real time as you speak
- **Google Meet-style mic/camera indicators** — live volume bars, camera status, and permission warnings
- **Detailed scorecard** — voice scores (clarity, structure, relevance, pacing, confidence) + body language scores
- **Per-answer feedback** — every answer gets individual AI coaching
- **Interactive 3D globe** on the landing page
- **Typeform-style onboarding** — gather user goals before sign-up
- **Supabase Auth** — email/password + Google OAuth
- **Dashboard** — track all past sessions with score trends

---

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Framework | Next.js 15 (App Router) | Free |
| Auth + Database | Supabase (Auth, Postgres) | Free tier |
| AI Conversation | Google Gemini 2.0 Flash | Free tier available |
| AI Voice Output | Google Cloud Text-to-Speech | ~$4 / 1M chars |
| User Voice Input | Web Speech API (browser) | Free |
| Camera Analysis | MediaPipe FaceLandmarker + PoseLandmarker (browser) | Free |
| Styling | Tailwind CSS + shadcn/ui | Free |
| Animations | Framer Motion | Free |

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18+ installed — [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **pnpm**
- A **Supabase** account — [supabase.com](https://supabase.com) (free)
- A **Google AI Studio** account — [aistudio.google.com](https://aistudio.google.com) (free)
- A **Google Cloud** account — [console.cloud.google.com](https://console.cloud.google.com) (free tier)
- A modern browser (Chrome recommended for Web Speech API support)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AI-Mock-interviewer.git
cd AI-Mock-interviewer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example below into a new `.env.local` file at the project root:

```env
# ── Supabase ──────────────────────────────────────────────────
# Get from: https://supabase.com → your project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ── Google Gemini ─────────────────────────────────────────────
# Get from: https://aistudio.google.com/app/apikey
# Free tier — no credit card needed
GEMINI_API_KEY=your-gemini-api-key-here

# ── Google Cloud Text-to-Speech ───────────────────────────────
# Get from: https://console.cloud.google.com
# 1. Create a project → Enable "Cloud Text-to-Speech API"
# 2. APIs & Services → Credentials → Create API Key
GOOGLE_TTS_API_KEY=your-google-tts-api-key-here
```

<details>
<summary><strong>How to get each key (step by step)</strong></summary>

#### Supabase (URL + Anon Key)
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Settings → API**
3. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Gemini API Key
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy it → `GEMINI_API_KEY`

#### Google Cloud TTS API Key
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services → Library**
4. Search for **"Cloud Text-to-Speech API"** and click **Enable**
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Copy it → `GOOGLE_TTS_API_KEY`

</details>

### 4. Set up the database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Paste the contents of [`lib/supabase/schema.sql`](lib/supabase/schema.sql)
4. Click **Run**

This creates all required tables (`profiles`, `sessions`, `session_answers`, `question_cache`), enables Row Level Security, and sets up an auto-profile trigger on signup.

### 5. Configure Supabase Auth (Optional — for Google OAuth)

1. In Supabase dashboard, go to **Authentication → Providers**
2. Enable **Google** provider
3. Add your Google OAuth Client ID and Secret
4. Set the redirect URL to: `http://localhost:3000/auth/callback`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
AI-Mock-interviewer/
├── app/
│   ├── api/
│   │   ├── interview/
│   │   │   ├── converse/route.ts      # Gemini multi-turn chat (core interviewer)
│   │   │   ├── questions/route.ts     # Gemini question generation
│   │   │   └── scorecard/route.ts     # Gemini scorecard with structured JSON
│   │   └── tts/route.ts              # Google Cloud TTS proxy
│   ├── auth/
│   │   ├── login/page.tsx            # Login (email + Google OAuth)
│   │   ├── signup/page.tsx           # Signup
│   │   └── callback/route.ts        # OAuth callback
│   ├── dashboard/page.tsx            # Session history + stats
│   ├── interview/
│   │   ├── setup/page.tsx            # Configure role, company, type, duration
│   │   ├── session/page.tsx          # Live interview room
│   │   └── results/[id]/page.tsx     # Scorecard + per-answer feedback
│   ├── onboarding/page.tsx           # 5-step typeform questionnaire
│   ├── layout.tsx
│   ├── page.tsx                      # Landing page
│   └── globals.css
├── components/
│   ├── interview/
│   │   ├── ai-orb.tsx                # Animated AI status indicator
│   │   ├── camera-feed.tsx           # Camera feed with HUD overlay
│   │   └── waveform.tsx              # Audio waveform visualizer
│   ├── ui/                           # shadcn/ui components
│   │   └── interactive-globe.tsx     # 3D canvas globe
│   ├── hero.tsx                      # Landing page hero section
│   └── navbar.tsx                    # Navigation bar
├── hooks/
│   ├── use-camera.ts                 # MediaPipe face + pose analysis
│   ├── use-interview.ts              # Interview state machine
│   └── use-speech.ts                 # TTS output + voice input + mic volume
├── lib/
│   └── supabase/
│       ├── client.ts                 # Browser Supabase client
│       ├── server.ts                 # Server Supabase client
│       └── schema.sql                # Database schema
├── middleware.ts                      # Route protection
├── .env.local                        # API keys (not committed)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## How It Works

```
User speaks → Web Speech API (free, browser) → transcript text
     ↓
Gemini 2.0 Flash → AI interviewer response
     ↓
Google Cloud TTS → audio buffer → played in browser
     ↓
MediaPipe (browser) → eye contact + posture + expression scores
```

### Interview Flow

1. **Onboarding** — User answers 5 questions about goals, role, and timeline
2. **Sign up / Sign in** — Supabase auth (email or Google OAuth)
3. **Setup** — Choose role, company, seniority, interview type, and duration
4. **Session** — AI asks questions via voice, user responds verbally, camera tracks body language in real time
5. **Scorecard** — AI analyzes the full transcript and generates detailed scores and per-answer feedback
6. **Dashboard** — View all past sessions with score trends

---

## Browser Requirements

| Feature | Browser Support |
|---|---|
| Web Speech API (voice input) | Chrome, Edge (recommended) |
| MediaPipe (camera analysis) | All modern browsers |
| Camera/Microphone | Requires HTTPS in production |
| Google Cloud TTS (voice output) | Server-side — works everywhere |

> **Note:** For full functionality, use **Google Chrome**. The Web Speech API has the best support there. Camera and microphone access requires **HTTPS** when deployed (localhost works without it).

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add all 4 environment variables in the Vercel dashboard
4. Deploy — Vercel handles HTTPS automatically

### Other platforms

Make sure to:
- Set all environment variables
- Enable HTTPS (required for camera/microphone permissions)
- Use Node.js 18+

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI conversation and scoring |
| `GOOGLE_TTS_API_KEY` | Yes | Google Cloud Text-to-Speech API key |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on `localhost:3000` |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

This project is for educational and portfolio purposes.
