# FanFlow — Tech Stack

All agents must use this stack. No substitutions without explicit approval.

---

## Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | 18+ | UI framework |
| Vite | 5+ | Build tool |
| Tailwind CSS | 3+ | Styling |
| @tailwindcss/forms | latest | Form element base styles |
| React Router DOM | 6+ | Client-side routing |
| lucide-react | latest | Icons |
| @react-google-maps/api | latest | Google Maps wrapper |

---

## Firebase (Google Cloud)
| Service | Purpose |
|---|---|
| Firebase Authentication | Google Sign-in, user sessions |
| Firebase Realtime Database | Live wait times, crowd zone data |
| Cloud Firestore | Food orders, menu items |

---

## Google APIs
| API | Purpose | Used By |
|---|---|---|
| Google Maps JavaScript API | Venue map rendering | Agent 03 |
| Maps Visualization Library | Heatmap layer | Agent 03 |
| Google Maps Directions API | Exit routing | Agent 06 |

---

## Deployment
| Tool | Purpose |
|---|---|
| Docker | Containerize React build via nginx |
| Google Cloud Run | Host and serve the container |
| Google Artifact Registry | Store Docker images |
| gcloud CLI | Deploy from terminal |

---

## Dev Tools
| Tool | Purpose |
|---|---|
| ESLint | Code quality |
| Jest | Unit testing |
| @testing-library/react | Component testing |
| @testing-library/jest-dom | DOM assertions |
| dotenv | Environment variable management |

---

## MCPs
| MCP | Purpose |
|---|---|
| Filesystem MCP | Agent file read/write |
| GitHub MCP | Version control + CRAFT commits |
| Google Cloud MCP | Cloud Run deploys |
| Puppeteer MCP | QA UI testing |
| Context7 MCP | Live API documentation |

---

## Environment Variables
All secrets stored in `.env`, never committed. Template in `.env.example`.

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_GOOGLE_MAPS_API_KEY
```
