# FanFlow 🏟️

> **Real-time crowd management platform for large-scale live events.**  
> Built as a full-stack Progressive Web App using React, Firebase, and Google Maps.

---

## What We Built

FanFlow is a mobile-first stadium companion app that gives fans and event staff a live view of crowd conditions across every corner of the venue. It was developed as a multi-agent build using a structured CRAFT loop.

### Core Features

| Feature | Route | Description |
|---|---|---|
| **Live Venue Map** | `/map` | Google Maps heatmap with real-time crowd density zones and color-coded gate markers |
| **Wait Times** | `/waittimes` | Live wait-time cards for concession stands, restrooms, and entry gates — streamed from Firebase RTDB |
| **Food Pre-Ordering** | `/order` | Menu browsing, cart, 15-min pickup slot selection, Firestore order tracking |
| **Smart Exit Planner** | `/exit` | Google Maps Directions route from best exit gate based on live crowd density and transport mode |
| **Crowd Simulation Engine** | `scripts/simulate.js` | Node.js script that pushes realistic 4-phase crowd waves to Firebase RTDB every 15 seconds |

### Stadium Model
The live simulation is anchored to **Narendra Modi Stadium, Ahmedabad** — the world's largest cricket stadium (capacity 132,000). Zone, gate, and concession positions are mapped to real GPS coordinates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Auth | Firebase Authentication (Google Sign-In) |
| Realtime DB | Firebase Realtime Database (crowd density, wait times) |
| Firestore | Cloud Firestore (food orders) |
| Maps | Google Maps JavaScript API + Visualization (HeatmapLayer) |
| Simulation | Node.js + Firebase Admin SDK |
| Deployment | Docker + Google Cloud Run |
| CI/CD | GitHub → Cloud Build → Cloud Run |

---

## Architecture

```
┌─────────────────┐     onValue()      ┌──────────────────────┐
│  React Frontend │ ◄────────────────── │ Firebase RTDB        │
│  (Vite + Maps)  │                     │ /zones /gates        │
└────────┬────────┘                     │ /concessions         │
         │ Auth                         │ /restrooms           │
         ▼                              └──────────▲───────────┘
┌─────────────────┐                                │ Admin SDK write
│ Firebase Auth   │                     ┌──────────┴───────────┐
│ (Google OAuth)  │                     │ simulate.js          │
└─────────────────┘                     │ 4-phase crowd engine │
                                        │ 15-second intervals  │
┌─────────────────┐                     └──────────────────────┘
│ Cloud Firestore │
│ /orders /menu   │  ◄── Food ordering flow
└─────────────────┘
```

---

## Local Development

### Prerequisites
- Node.js 20+
- A Firebase project with Auth, RTDB, and Firestore enabled
- A Google Maps JavaScript API key with Visualization and Directions enabled
- Firebase service account JSON (for the simulation engine)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp .env.example .env
# Fill in your Firebase and Google Maps keys

# 3. Run the React app
npm run dev

# 4. In a second terminal — run the crowd simulation
npm run simulate
```

The simulation will begin writing crowd data to RTDB immediately. The React app listens via `onValue()` and updates in real-time.

### Environment Variables (`.env`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_GOOGLE_MAPS_API_KEY=
```

> **Security note:** The service account JSON for the simulation engine goes in `scripts/`. It is excluded from git via `.gitignore` and must never be committed.

---

## Deployment — GitHub → Cloud Run

### How it works
Every push to `main` triggers a **Cloud Build pipeline** (`cloudbuild.yaml`) that:
1. Builds the Docker image with Firebase keys injected as build args
2. Pushes the image to Google Container Registry
3. Deploys the new revision to Cloud Run automatically

### One-time setup in Google Cloud Console

1. **Enable APIs:** Cloud Run, Cloud Build, Container Registry
2. **Cloud Run → Create Service → "Continuously deploy from a repository"**
3. Connect your GitHub repo and select `main` branch
4. Set **Build type** to `Dockerfile`
5. Under **Cloud Build → Trigger Settings → Substitution Variables**, add:

| Variable | Value |
|---|---|
| `_VITE_FIREBASE_API_KEY` | your key |
| `_VITE_FIREBASE_AUTH_DOMAIN` | your domain |
| `_VITE_FIREBASE_DATABASE_URL` | your URL |
| `_VITE_FIREBASE_PROJECT_ID` | your project ID |
| `_VITE_FIREBASE_STORAGE_BUCKET` | your bucket |
| `_VITE_FIREBASE_MESSAGING_SENDER_ID` | your sender ID |
| `_VITE_FIREBASE_APP_ID` | your app ID |
| `_VITE_FIREBASE_MEASUREMENT_ID` | your measurement ID |
| `_VITE_GOOGLE_MAPS_API_KEY` | your Maps key |

6. Set **Allow unauthenticated invocations** → ON  
7. Set **Port** → `8080`

After setup, every `git push` to `main` will auto-deploy a new revision.

---

## Firebase Console Setup

| Service | Configuration |
|---|---|
| Authentication | Enable Google Sign-In provider |
| Realtime Database | Rules: `.read: true`, `.write: "auth != null"` |
| Firestore | Enable in production mode |
| Authorized domains | Add your Cloud Run URL to Firebase Auth |

> After deploying to Cloud Run, paste your `*.run.app` URL into Firebase Console → Authentication → Authorized Domains.

---

## What Can Be Extended

This platform is designed to be modular. Here are high-value extensions:

### 🔴 High Value
- **Real sensor integration** — Replace simulate.js with an IoT gateway that reads from physical crowd sensors (LIDAR, WiFi triangulation, camera-based AI counting)
- **Staff dashboard** — Venue operator view with incident flagging, gate capacity override, and alert thresholds
- **Push notifications** — Firebase Cloud Messaging when a gate hits >80% capacity
- **Multi-venue support** — Abstract the venue config so the same app can run for different stadiums

### 🟡 Medium Value
- **Offline support** — Service worker + IndexedDB cache for connectivity-poor stadium environments
- **Native apps** — Wrap in Capacitor or React Native for App Store / Play Store distribution
- **Order management** — Vendor-side UI so concession staff can mark orders as "ready"
- **Analytics dashboard** — Firebase Analytics + BigQuery export of crowd density time-series

### 🟢 Quick Wins
- **Dark mode** — Tailwind `dark:` classes are already partially in place
- **Language localization** — i18n for Hindi and Gujarati (relevant for the Motera venue)
- **Accessibility audit refresh** — Run Lighthouse and fix any remaining contrast/ARIA gaps
- **Unit tests** — Add Vitest + React Testing Library for the auth and order flows

---

## Project Structure

```
fanflow/
├── src/
│   ├── auth/              # ProtectedRoute wrapper
│   ├── context/           # AuthContext (Firebase Auth state)
│   ├── components/
│   │   └── layout/        # Header, BottomNav, Layout
│   ├── data/
│   │   └── mockData.js    # Narendra Modi Stadium venue config + seed data
│   ├── pages/
│   │   ├── VenueMap.jsx   # Google Maps heatmap + zone markers
│   │   ├── WaitTimes.jsx  # Live wait time cards
│   │   ├── FoodOrder.jsx  # Menu + cart + Firestore checkout
│   │   └── ExitPlanner.jsx# Directions API + crowd exit logic
│   └── firebase.js        # Firebase SDK initialization
├── scripts/
│   └── simulate.js        # Crowd simulation engine (Node.js + Admin SDK)
├── Dockerfile             # Multi-stage build: Node builder → nginx
├── cloudbuild.yaml        # CI/CD pipeline for Cloud Run
├── nginx.conf             # SPA routing config for nginx
└── .env.example           # Environment variable template
```

---

## License

MIT — built for the FanFlow Prompt Wars Challenge.
