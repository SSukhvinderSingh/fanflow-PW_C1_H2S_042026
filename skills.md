# FanFlow — skills.md
Shared skills referenced by agents. Each skill provides the exact pattern, schema, or boilerplate the agent should follow. Agents must not deviate from these patterns without a documented reason in their Handoff Notes.

---

## Skill: MCP Installation (Run Before Any Agent)

**Used by:** Agent 01 (must complete ALL installations before proceeding)
**Enforcement:** All 5 MCPs must be installed and verified working before Agent 01 begins scaffolding.

---

### 1. Filesystem MCP
Gives agents the ability to read and write files on the local system.

```bash
npx @anthropic-ai/create-mcp-server filesystem
```

Or via GitHub:
```bash
git clone https://github.com/modelcontextprotocol/servers.git
cd servers/src/filesystem
npm install
npm run build
```

**Config entry (claude_desktop_config.json or antigravity config):**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/fanflow"
      ]
    }
  }
}
```

**Verify:** Agent can list, read and write files in the project directory.

---

### 2. GitHub MCP
Gives agents the ability to commit, push, create branches and track changes — powers the **T (Track)** step in the CRAFT loop.

```bash
git clone https://github.com/modelcontextprotocol/servers.git
cd servers/src/github
npm install
npm run build
```

**Config entry:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your_github_pat>"
      }
    }
  }
}
```

**GitHub PAT Permissions required:**
- `repo` — full repository access
- `workflow` — for CI/CD triggers if needed
- `read:org` — org level access

**Verify:** Agent can run `git status`, create a commit and push to remote.

---

### 3. Google Cloud MCP
Gives agents the ability to deploy to Cloud Run, manage containers in Artifact Registry and set environment variables.

```bash
git clone https://github.com/GoogleCloudPlatform/cloud-run-mcp.git
cd cloud-run-mcp
npm install
npm run build
```

**Prerequisites before install:**
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Authenticate
gcloud auth login
gcloud auth application-default login

# Set project
gcloud config set project YOUR_GCP_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

**Config entry:**
```json
{
  "mcpServers": {
    "gcloud": {
      "command": "node",
      "args": ["/path/to/cloud-run-mcp/build/index.js"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "<your_gcp_project_id>",
        "GOOGLE_CLOUD_REGION": "us-central1"
      }
    }
  }
}
```

**Verify:** Agent can run `gcloud run services list` and see the project.

---

### 4. Puppeteer MCP
Gives Agent 08 the ability to launch a browser, navigate pages, interact with UI elements and capture screenshots for QA validation.

```bash
git clone https://github.com/modelcontextprotocol/servers.git
cd servers/src/puppeteer
npm install
npm run build
```

**Config entry:**
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**Puppeteer dependencies:**
```bash
# Ensure Chromium is available
npx puppeteer browsers install chrome
```

**Verify:** Agent can open `http://localhost:5173` and take a screenshot.

---

### 5. Context7 MCP
Gives all agents access to up-to-date library documentation — prevents outdated API patterns for React, Firebase, Google Maps, Tailwind, and Vite.

```bash
git clone https://github.com/upstash/context7-mcp.git
cd context7-mcp
npm install
npm run build
```

**Config entry:**
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

**Verify:** Agent can query `use context7` and retrieve current React 18 docs.

---

### Full MCP Config Block (All 5 Together)
Drop this into your Antigravity / Claude Desktop config file:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/fanflow"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your_github_pat>"
      }
    },
    "gcloud": {
      "command": "node",
      "args": ["/path/to/cloud-run-mcp/build/index.js"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "<your_gcp_project_id>",
        "GOOGLE_CLOUD_REGION": "us-central1"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

---

### MCP Verification Checklist (Agent 01 must confirm before proceeding)
- [ ] Filesystem MCP — can read/write `/fanflow` directory
- [ ] GitHub MCP — can commit and push to repo
- [ ] Google Cloud MCP — can list Cloud Run services
- [ ] Puppeteer MCP — can open browser and screenshot localhost
- [ ] Context7 MCP — can retrieve live library docs

**If any MCP fails verification → stop and fix before continuing.**

---

## Skill: Project Scaffold

**Used by:** Agent 01

### Vite + React Init
```bash
npm create vite@latest fanflow -- --template react
cd fanflow
npm install
```

### Tailwind Setup
```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms
npx tailwindcss init -p
```

`tailwind.config.js`
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#1D4ED8",
        brandLight: "#DBEAFE",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
```

### Folder Structure
```
src/
├── auth/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   └── BottomNav.jsx
│   └── ui/
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── VenueMap.jsx
│   ├── WaitTimes.jsx
│   ├── FoodOrder.jsx
│   └── ExitPlanner.jsx
├── data/
│   └── mockData.js
├── firebase.js
└── main.jsx
```

### React Router Setup
```jsx
// main.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/map" element={<ProtectedRoute><VenueMap /></ProtectedRoute>} />
    <Route path="/waittimes" element={<ProtectedRoute><WaitTimes /></ProtectedRoute>} />
    <Route path="/order" element={<ProtectedRoute><FoodOrder /></ProtectedRoute>} />
    <Route path="/exit" element={<ProtectedRoute><ExitPlanner /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/map" />} />
  </Routes>
</BrowserRouter>
```

---

## Skill: Mock Data

**Used by:** Agent 01

### Schema
```js
// src/data/mockData.js

export const venueConfig = {
  name: "FanFlow Venue",
  center: { lat: 0.0, lng: 0.0 }, // Neutral placeholder coords
  eventEndTime: "22:00",
};

// 30 rows — Concession Stands
export const concessions = [ /* 30 items */ ];
// Schema: { id, name, zone, waitMinutes, crowdLevel, lastUpdated }

// 30 rows — Restrooms
export const restrooms = [ /* 30 items */ ];
// Schema: { id, name, zone, queueLength, crowdLevel, lastUpdated }

// 30 rows — Entry Gates
export const gates = [ /* 30 items */ ];
// Schema: { id, name, zone, crowdDensity, recommendedFor, lastUpdated }

// 40 rows — Menu Items
export const menuItems = [ /* 40 items */ ];
// Schema: { id, name, category, price, available, imageUrl }

// 20 rows — Venue Zones
export const venueZones = [ /* 20 items */ ];
// Schema: { id, name, lat, lng, crowdLevel, capacity, current }
```

### crowdLevel Values
Always one of: `"low"` | `"medium"` | `"high"`

### Total: 150 rows (30 + 30 + 30 + 40 + 20)

---

## Skill: Firebase Init

**Used by:** Agent 01

```js
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
```

### .env.example
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
```

---

## Skill: Docker + Cloud Run

**Used by:** Agent 01

### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
  listen 8080;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Cloud Run Deploy Command
```bash
gcloud run deploy fanflow \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Skill: Firebase Authentication

**Used by:** Agent 02

```js
// src/auth/googleAuth.js
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
```

---

## Skill: AuthContext

**Used by:** Agent 02

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { signInWithGoogle, logout } from "../auth/googleAuth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## Skill: Protected Route

**Used by:** Agent 02

```jsx
// src/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
```

---

## Skill: Google Maps Init

**Used by:** Agent 03, Agent 06

```jsx
import { LoadScript } from "@react-google-maps/api";

const LIBRARIES = ["visualization", "places"];

<LoadScript
  googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
  libraries={LIBRARIES}
>
  {/* Map components here */}
</LoadScript>
```

---

## Skill: HeatmapLayer

**Used by:** Agent 03

```jsx
import { GoogleMap, HeatmapLayer } from "@react-google-maps/api";

// Data format for HeatmapLayer
const heatmapData = venueZones.map(zone => ({
  location: new window.google.maps.LatLng(zone.lat, zone.lng),
  weight: zone.crowdLevel === "high" ? 3 : zone.crowdLevel === "medium" ? 2 : 1,
}));

<HeatmapLayer
  data={heatmapData}
  options={{ radius: 40, opacity: 0.6 }}
/>
```

---

## Skill: Firebase Realtime Listener

**Used by:** Agent 03, Agent 04, Agent 06

```js
import { ref, onValue, off } from "firebase/database";
import { db } from "../firebase";

// Inside useEffect
const zoneRef = ref(db, "/zones");
const unsub = onValue(zoneRef, (snapshot) => {
  const data = snapshot.val();
  if (data) setZones(Object.values(data));
});

// Cleanup
return () => off(zoneRef);
```

---

## Skill: Wait Time Card Component

**Used by:** Agent 04

```jsx
const WaitCard = ({ name, waitMinutes, crowdLevel, lastUpdated }) => {
  const color =
    waitMinutes < 5 ? "bg-green-100 text-green-800" :
    waitMinutes < 15 ? "bg-amber-100 text-amber-800" :
    "bg-red-100 text-red-800";

  return (
    <div
      className="rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
      role="article"
      aria-label={`${name}, wait time ${waitMinutes} minutes`}
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-900 text-base">{name}</span>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${color}`}>
          {waitMinutes} min
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">Updated {lastUpdated}</p>
    </div>
  );
};
```

---

## Skill: Firestore Write

**Used by:** Agent 05

```js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";

const placeOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(firestore, "orders"), {
      ...orderData,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Order failed:", err);
    throw err;
  }
};
```

---

## Skill: Cart State

**Used by:** Agent 05

```jsx
// Cart state managed with useReducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      const existing = state.find(i => i.id === action.item.id);
      if (existing) return state.map(i =>
        i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
      );
      return [...state, { ...action.item, qty: 1 }];
    case "REMOVE":
      return state.filter(i => i.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return state;
  }
};

const [cart, dispatch] = useReducer(cartReducer, []);
```

---

## Skill: Google Maps Directions API

**Used by:** Agent 06

```jsx
import { DirectionsRenderer, DirectionsService } from "@react-google-maps/api";

const [directions, setDirections] = useState(null);

const handleDirections = (result, status) => {
  if (status === "OK") setDirections(result);
};

<DirectionsService
  options={{
    origin: exitGateCoords,
    destination: userDestination,
    travelMode: selectedMode, // WALKING | DRIVING | TRANSIT
  }}
  callback={handleDirections}
/>
{directions && <DirectionsRenderer directions={directions} />}
```

---

## Skill: ARIA Patterns

**Used by:** Agent 07

### Live Regions (for real-time data)
```jsx
<div aria-live="polite" aria-atomic="true">
  {/* Wait time cards, order status updates */}
</div>
```

### Icon Accessibility
```jsx
// Decorative icon (has adjacent text label)
<MapPin aria-hidden="true" />

// Meaningful icon (no text label)
<MapPin aria-label="Venue location" role="img" />
```

### Skip Navigation
```jsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-4 py-2 rounded z-50"
>
  Skip to main content
</a>
```

### Focus Trap (for modals/panels)
```jsx
// Use focus-trap-react package or manual tabIndex management
// First focusable element gets autoFocus on open
// Escape key closes the panel
```

---

## Skill: Keyboard Navigation

**Used by:** Agent 07

```jsx
// Keyboard handler pattern
const handleKeyDown = (e, action) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    action();
  }
  if (e.key === "Escape") {
    closePanel();
  }
};

// Apply to interactive divs
<div
  role="button"
  tabIndex={0}
  onClick={action}
  onKeyDown={(e) => handleKeyDown(e, action)}
  aria-label="Description of action"
>
```

---

## Skill: Puppeteer Testing

**Used by:** Agent 08

```js
// QA test pattern per page
const puppeteer = require("puppeteer");

const runTest = async (route, testName, testFn) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 }); // iPhone 14 viewport
  await page.goto(`http://localhost:5173${route}`);
  await testFn(page);
  await browser.close();
  console.log(`✅ ${testName} passed`);
};
```

---

## Skill: CRAFT Log

**Used by:** Agent 08

### Log Entry Format
```markdown
## Cycle [N] — [Date] — Agent [XX]: [Feature Name]

**R — Run:**
> What was executed and what the actual output was

**A — Analyze:**
> What failed, what was unexpected, root cause

**F — Fix:**
> Exact change made, file affected, line changed

**T — Track:**
> git commit -m "fix([feature]): [what was fixed]"

**Result:** ✅ Passed / ❌ Still failing (→ Cycle N+1)
```
