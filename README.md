# GenAI Labs – AI Response Quality Analyzer

The AI Response Quality Analyzer is a full-stack lab for studying how large language model (LLM) sampling parameters such as `temperature` and `top_p` influence response quality. It couples a polished, glassmorphism-inspired React experience with a type-safe Express API, OpenAI integration, and an embedded SQLite warehouse that preserves every experiment you run.

The project is organised as a pnpm-style monorepo (using npm workspaces) with the following top-level packages:

| Package   | Location   | Description |
|-----------|------------|-------------|
| Frontend  | `frontend/` | Next.js 15 App Router app using Tailwind CSS v4, shadcn/ui, TanStack Query, and Recharts for visualisation. |
| Backend   | `backend/`  | Express 5 API with TypeScript, Zod validation, OpenAI SDK calls, and `better-sqlite3` for persistence. |
| Shared    | `shared/`   | (Reserved) Cross-cutting utilities and types consumed by both services. |

---

## ✨ Highlights

- **Visual experiment lab** – enter a prompt, choose sampling grids, run multiple variations, and inspect comparative metrics side-by-side.
- **Quality scoring pipeline** – every response is analysed for coherence, completeness, redundancy, readability, and structure; scores are persisted and exposed via the API.
- **Live + mock operation** – if an `OPENAI_API_KEY` is present the API streams completions from OpenAI; without a key it falls back to high-fidelity mock responses so the UI and end-to-end flow keep working.
- **Experiment history** – each run is versioned in SQLite and immediately available in the history sidebars for recall, renaming, or exporting as JSON/CSV.
- **Dark/light adaptive UI** – the glass UI automatically matches the user’s system theme, with graceful pulses guiding users to the Inspect drawer.
- **Typed contracts** – Zod schemas guard request payloads, TypeScript models the full API surface, and Vitest integration tests ensure core behaviour is stable.

---

## 🗂️ Repository Structure

```
.
├── Assets/                  # Branding assets shared by the UI
├── backend/                 # Express + SQLite API
│   ├── src/
│   │   ├── env.ts           # Environment schema & defaults
│   │   ├── lib/             # Metrics, OpenAI client, DB helpers
│   │   └── routes/          # REST endpoints
│   ├── tests/               # Vitest API integration tests
│   └── package.json
├── frontend/                # Next.js App Router + design system
│   ├── app/                 # Pages, layouts, providers
│   ├── components/          # shadcn/ui + custom glass components
│   ├── lib/                 # API client, helpers
│   └── package.json
├── docs/                    # Internal documentation (not published)
└── README.md                # This document
```

> **Note:** `docs/Technical_guide.md` contains the extended internal brief and stays local; it is excluded from version control and deployments.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
# Clone this repository
 git clone https://github.com/Rexdomine/GenAILabs-Project-.git
 cd GenAILabs-Project-

# Install app dependencies
 cd frontend && npm install
 cd ../backend && npm install
```

### 2. Configure environment variables

Create the following files (based on the examples) before running the stack:

- `frontend/.env.local`

  ```bash
  NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
  NEXT_PUBLIC_SENTRY_DSN=
  ```

- `backend/.env`

  ```bash
  OPENAI_API_KEY=sk-your-key          # optional – enables live OpenAI calls
  PORT=4000
  DATABASE_URL=file:./db.sqlite       # points to the local SQLite database
  SENTRY_DSN=
  CORS_ORIGINS=
  ```

> When **no OpenAI key** is provided, the API generates rich placeholder responses so you can demo the UI and metrics without external dependencies.

### 3. Run the backend API

```bash
cd backend
npm run dev
```

The backend boots on `http://localhost:4000` exposing:

| Method | Endpoint                  | Description |
|--------|---------------------------|-------------|
| GET    | `/healthz`                | Basic runtime & env status check |
| POST   | `/api/generate`           | Kickstarts a new experiment, calling OpenAI (or mocks) for each parameter combination |
| GET    | `/api/experiments`        | Paginated list of past experiments |
| GET    | `/api/experiments/:id`    | Fetch full experiment with responses + metrics |
| PATCH  | `/api/experiments/:id`    | Rename an experiment |
| DELETE | `/api/experiments/:id`    | Remove an experiment and its responses |
| POST   | `/api/export/:id`         | Produce a CSV/JSON export payload |

### 4. Run the frontend lab

```bash
cd frontend
npm run dev
```

By default the UI is available on `http://localhost:3000`. Enter a prompt, tweak temperature & top-p grids, and click **Send** – the Transcript, Inspect drawer, and History sidebar will all update in real-time. The Inspect drawer’s pulse invites you to compare metrics and trigger exports.

---

## ⚙️ Backend Architecture

- **Framework:** Express 5 + TypeScript – modern middleware pipeline with async/await native support.
- **Validation:** Zod schemas (`generateRequestSchema`, `parameterSetSchema`, etc.) ensure every request matches expected types before work begins.
- **Persistence:** SQLite (via `better-sqlite3`) stores experiments/responses. WAL mode keeps writes fast and consistent.
- **Metrics Engine:** `src/lib/metrics.ts` computes coherence, completeness, redundancy, readability, structure, and aggregate score for every response. Metrics are stored as JSON to preserve future extensibility.
- **OpenAI Integration:** `src/lib/openai.ts` builds Cartesian parameter grids, calls the Chat Completions API, and gracefully falls back to deterministic mock responses if the API call fails or when no key is configured.
- **Observability:** Optional Sentry DSN wiring captures exceptions; otherwise errors surface in structured JSON replies.

### Backend scripts

```bash
# Run the dev server with hot-reload
npm run dev

# Type-check & build to dist/
npm run build

# Execute Vitest suite (integration tests live in backend/tests)
npm test
```

---

## 🎨 Frontend Architecture

- **Framework:** Next.js 15 (App Router) with React 19 and TypeScript.
- **Design System:** Tailwind CSS v4, shadcn/ui primitives, and custom glassmorphism helpers provide the “liquid glass” interface.
- **State/Data Layer:** TanStack Query coordinates data fetching, caching, optimistic updates, and query invalidation between the lab, history, and inspector views.
- **Charts:** Recharts powers radar and line charts in the Inspect drawer, translating the backend’s metrics to clear visual signatures.
- **Theme Handling:** A small pre-hydration script reads `prefers-color-scheme`, synchronising the UI with the user’s device theme and adjusting colour tokens.
- **UX Enhancements:**
  - Pulsing Inspect button nudges users to dive into metrics
  - Auto-scroll chat transcript keeps the latest responses visible
  - History sidebar supports inline renaming with persistence
  - Dark/light-optimised tokens guarantee legibility

### Frontend scripts

```bash
# Run the Next.js dev server
npm run dev

# Build production bundle
npm run build

# Lint the codebase
npm run lint
```

---

## 🧪 Testing & Quality Checks

| Area      | Command                          | Notes |
|-----------|----------------------------------|-------|
| Backend   | `cd backend && npm test`         | Vitest integration suite hits `/api/generate` and checks DB persistence. |
| Frontend  | `cd frontend && npm run lint`    | ESLint (Flat config) ensures components and hooks obey best practices. |
| Manual QA | Run both dev servers, submit prompts, inspect results, rename history items, and export data. |

> Tip: Inspect the generated SQLite database (`backend/db.sqlite`) with your favourite GUI or `sqlite3` CLI to confirm experiments persist as expected.

---

## 📦 Exporting & Persistence

- Every experiment receives a UUID, the prompt, model, parameter sets, variations count, and created timestamp.
- Each response stores: parameter set, variation index, raw text, quality metrics, and created timestamp.
- The **Export** tab in the Inspect drawer calls `/api/export/:id` and returns a ready-to-download JSON or CSV payload for sharing or downstream analytics.

---

## 🚢 Deployment Notes

- **Backend:** Targets modern Node 20+. Deploy seamlessly to Render, Railway, Fly.io, or any Node-compatible host. Mount a persistent volume if you prefer SQLite, or switch `DATABASE_URL` to a Postgres connection string.
- **Frontend:** Optimised for Vercel (Edge ready) but runs on any Next.js-compatible platform.
- **Environment:** Ensure both services share the same `NEXT_PUBLIC_API_BASE_URL` and `OPENAI_API_KEY`. Configure CORS (`CORS_ORIGINS`) when hosting across domains.
- **Monitoring:** Supply Sentry DSNs on both sides to capture runtime exceptions and performance traces automatically.

---

## 🤝 Contributing

1. Fork and clone the repo (`git clone https://github.com/Rexdomine/GenAILabs-Project-.git`).
2. Create a feature branch (`git checkout -b feat/awesome-upgrade`).
3. Run the relevant lint/tests before committing.
4. Submit a PR describing your changes and how to validate them.

> Please keep `docs/Technical_guide.md` local-only; it contains internal notes not intended for the public repository.

---

## 📬 Support & Questions

- Found a bug or have a feature idea? Open an issue or reach out via the GenAI Labs challenge channel.
- API rate-limit concerns? Configure exponential backoff in `src/lib/openai.ts` or tune your OpenAI usage plan.
- Need to reset the local database? Stop the backend, delete `backend/db.sqlite` (and WAL files), then rerun migrations by starting the server.

---

Happy experimenting! ☄️
