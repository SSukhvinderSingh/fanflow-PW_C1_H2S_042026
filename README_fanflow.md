# FanFlow 🏟️
### Real-time Attendee Experience Platform for Large-Scale Events

FanFlow is a web-based attendee companion that improves the physical event experience at any large-scale sporting or entertainment venue. It addresses crowd movement, waiting times, and real-time coordination — all in one seamless interface.

---

## 🎯 Problem Statement
Large venues create friction at every step — entry queues, concession waits, restroom crowding, and chaotic exits. FanFlow puts real-time intelligence in the attendee's hands, making every moment at the event smoother and more enjoyable.

---

## 🌍 Design Principles
- **Place Agnostic** — Works for any venue type (stadium, arena, amphitheatre)
- **Sport Agnostic** — No hardcoded sport-specific language
- **Attendee First** — Every feature serves the person in the seat
- **Mobile First** — Designed for phones in hand at a live event

---

## 🏗️ Agent Execution Order
Agents run **sequentially**. Never in parallel. Each agent must complete and leave handoff notes before the next begins.

```
Agent 01 → Setup & Scaffold
Agent 02 → Authentication
Agent 03 → Venue Map
Agent 04 → Wait Times
Agent 05 → Food Ordering
Agent 06 → Exit Planner
Agent 07 → Accessibility
Agent 08 → QA & CRAFT Coordinator
```

---

## 🛠️ Tech Stack
See `docs/TECH_STACK.md` for full detail.

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Auth | Firebase Authentication |
| Realtime Data | Firebase Realtime Database |
| Database | Cloud Firestore |
| Maps | Google Maps JavaScript API |
| Deployment | Google Cloud Run |
| Containerization | Docker |
| Version Control | GitHub |

---

## 📦 MCPs Required
| MCP | Purpose |
|---|---|
| Filesystem MCP | Agents read/write project files |
| GitHub MCP | Version control + CRAFT T-Track commits |
| Google Cloud MCP | Cloud Run deployment & env management |
| Puppeteer MCP | QA agent UI testing |
| Context7 MCP | Latest API docs for all libraries |

---

## 📁 Project Structure
```
fanflow/
├── README.md
├── agents.md
├── skills.md
├── docs/
│   ├── PROBLEM_STATEMENT.md
│   ├── TECH_STACK.md
│   └── EVALUATION_TARGETS.md
└── craft/
    └── ITERATION_LOG.md
```

---

## 🔄 CRAFT Loop
After each agent runs, follow this loop:

| Step | Action |
|---|---|
| **R** — Run | Execute the output and read actual result |
| **A** — Analyze | Note what failed and why |
| **F** — Fix | Fix one thing, re-run, compare |
| **T** — Track | Commit with meaningful message |

All iterations are logged in `craft/ITERATION_LOG.md`

---

## 🚀 Getting Started
```bash
# 1. Clone the repo
git clone https://github.com/your-org/fanflow.git

# 2. Install dependencies
cd fanflow && npm install

# 3. Set environment variables
cp .env.example .env

# 4. Run locally
npm run dev

# 5. Deploy to Cloud Run
gcloud run deploy fanflow --source .
```

---

## 📊 Evaluation Targets
See `docs/EVALUATION_TARGETS.md` for scoring breakdown and targets.

---

*FanFlow — Every moment, seamlessly yours.*
