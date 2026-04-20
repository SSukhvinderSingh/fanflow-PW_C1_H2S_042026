// ============================================================
// FanFlow — Crowd Simulation Engine
// Stadium: Narendra Modi Stadium, Ahmedabad
// Writes live crowd data to Firebase RTDB every 15 seconds
// Usage: node scripts/simulate.js
// ============================================================

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Firebase Admin Initialization ---
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "fanflow-live-firebase-adminsdk-fbsvc-fde06d13cb.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fanflow-live-default-rtdb.firebaseio.com",
});

const db = admin.database();

// ============================================================
// STADIUM DATA — Narendra Modi Stadium
// ============================================================

const GATES = [
  { id: "gate_a", name: "Gate A — North Main",  lat: 23.0942, lng: 72.5972 },
  { id: "gate_b", name: "Gate B — North East",  lat: 23.0933, lng: 72.5997 },
  { id: "gate_c", name: "Gate C — South East",  lat: 23.0895, lng: 72.5997 },
  { id: "gate_d", name: "Gate D — South Main",  lat: 23.0886, lng: 72.5972 },
  { id: "gate_e", name: "Gate E — South West",  lat: 23.0895, lng: 72.5947 },
  { id: "gate_f", name: "Gate F — North West",  lat: 23.0933, lng: 72.5947 },
];

const ZONES = [
  { id: "zone_adani",    name: "Adani End (North)",   lat: 23.0932, lng: 72.5972, capacity: 33000 },
  { id: "zone_reliance", name: "Reliance End (South)", lat: 23.0896, lng: 72.5972, capacity: 33000 },
  { id: "zone_east",     name: "East Stand",           lat: 23.0914, lng: 72.5997, capacity: 33000 },
  { id: "zone_west",     name: "West Stand (VIP)",     lat: 23.0914, lng: 72.5947, capacity: 33000 },
];

const CONCESSIONS = [
  { id: "conc_1", name: "North Concourse — Stall 1" },
  { id: "conc_2", name: "North Concourse — Stall 2" },
  { id: "conc_3", name: "East Concourse — Stall 1"  },
  { id: "conc_4", name: "East Concourse — Stall 2"  },
  { id: "conc_5", name: "South Concourse — Stall 1" },
  { id: "conc_6", name: "West Concourse (VIP)"       },
];

const RESTROOMS = [
  { id: "rest_1", name: "North Block — Restrooms" },
  { id: "rest_2", name: "East Block — Restrooms"  },
  { id: "rest_3", name: "South Block — Restrooms" },
  { id: "rest_4", name: "West Block — Restrooms"  },
];

// ============================================================
// EVENT PHASES
// Each phase runs for ~3 minutes (12 x 15s ticks)
// ============================================================

const PHASES = [
  {
    name: "Pre-Match",
    // Fans slowly arriving — gates starting to fill
    gates:       { minWait: 1,  maxWait: 6,  minDensity: 10, maxDensity: 35 },
    zones:       { minDensity: 10, maxDensity: 30 },
    concessions: { minWait: 1,  maxWait: 5  },
    restrooms:   { minWait: 1,  maxWait: 4  },
  },
  {
    name: "Peak Entry",
    // Rush before match — gates at high pressure
    gates:       { minWait: 12, maxWait: 25, minDensity: 65, maxDensity: 95 },
    zones:       { minDensity: 40, maxDensity: 70 },
    concessions: { minWait: 5,  maxWait: 12 },
    restrooms:   { minWait: 3,  maxWait: 8  },
  },
  {
    name: "Half-Time",
    // Gates quiet, concessions & restrooms surge
    gates:       { minWait: 1,  maxWait: 4,  minDensity: 5,  maxDensity: 20 },
    zones:       { minDensity: 55, maxDensity: 80 },
    concessions: { minWait: 15, maxWait: 30 },
    restrooms:   { minWait: 12, maxWait: 22 },
  },
  {
    name: "Post-Match",
    // Everyone exits simultaneously — all gates surge
    gates:       { minWait: 18, maxWait: 40, minDensity: 80, maxDensity: 100 },
    zones:       { minDensity: 20, maxDensity: 50 }, // stands emptying
    concessions: { minWait: 2,  maxWait: 6  },
    restrooms:   { minWait: 5,  maxWait: 10 },
  },
];

// ============================================================
// HELPERS
// ============================================================

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const crowdLevel = (density) => {
  if (density >= 70) return "high";
  if (density >= 35) return "medium";
  return "low";
};

// ============================================================
// WRITE TO RTDB
// ============================================================

async function writePhaseData(phase) {
  const updates = {};
  const now = Date.now();

  // Gates
  GATES.forEach((gate) => {
    const density = rand(phase.gates.minDensity, phase.gates.maxDensity);
    const waitTime = rand(phase.gates.minWait, phase.gates.maxWait);
    updates[`/gates/${gate.id}`] = {
      id: gate.id, name: gate.name,
      lat: gate.lat, lng: gate.lng,
      waitTime, crowdDensity: density,
      crowdLevel: crowdLevel(density),
      lastUpdated: now,
    };
  });

  // Zones
  ZONES.forEach((zone) => {
    const density = rand(phase.zones.minDensity, phase.zones.maxDensity);
    const current = Math.floor((density / 100) * zone.capacity);
    updates[`/zones/${zone.id}`] = {
      id: zone.id, name: zone.name,
      lat: zone.lat, lng: zone.lng,
      capacity: zone.capacity, current,
      crowdDensity: density,
      crowdLevel: crowdLevel(density),
      lastUpdated: now,
    };
  });

  // Concessions
  CONCESSIONS.forEach((c) => {
    const waitTime = rand(phase.concessions.minWait, phase.concessions.maxWait);
    updates[`/concessions/${c.id}`] = {
      id: c.id, name: c.name,
      waitTime,
      crowdLevel: waitTime > 15 ? "high" : waitTime > 8 ? "medium" : "low",
      lastUpdated: now,
    };
  });

  // Restrooms
  RESTROOMS.forEach((r) => {
    const waitTime = rand(phase.restrooms.minWait, phase.restrooms.maxWait);
    updates[`/restrooms/${r.id}`] = {
      id: r.id, name: r.name,
      waitTime,
      crowdLevel: waitTime > 12 ? "high" : waitTime > 6 ? "medium" : "low",
      lastUpdated: now,
    };
  });

  await db.ref().update(updates);
}

// ============================================================
// SIMULATION LOOP
// 4 phases × 12 ticks × 15s = ~12 minutes per full cycle
// ============================================================

const TICKS_PER_PHASE = 12;
const TICK_INTERVAL_MS = 15000;

let phaseIndex = 0;
let tickCount = 0;

async function tick() {
  const phase = PHASES[phaseIndex];

  console.log(`\n[FanFlow Sim] Phase: ${phase.name} | Tick ${tickCount + 1}/${TICKS_PER_PHASE}`);
  console.log(`[FanFlow Sim] Writing crowd data to Firebase RTDB...`);

  try {
    await writePhaseData(phase);
    console.log(`[FanFlow Sim] ✅ RTDB updated successfully`);
  } catch (err) {
    console.error(`[FanFlow Sim] ❌ RTDB write failed:`, err.message);
  }

  tickCount++;
  if (tickCount >= TICKS_PER_PHASE) {
    tickCount = 0;
    phaseIndex = (phaseIndex + 1) % PHASES.length;
    console.log(`\n[FanFlow Sim] ⏭  Moving to phase: ${PHASES[phaseIndex].name}`);
  }
}

console.log("============================================================");
console.log("  FanFlow Crowd Simulation Engine");
console.log("  Stadium: Narendra Modi Stadium, Ahmedabad");
console.log("  Interval: 15 seconds | Phases: 4 | Cycle: ~12 minutes");
console.log("  Press Ctrl+C to stop");
console.log("============================================================\n");

// Run immediately then on interval
tick();
setInterval(tick, TICK_INTERVAL_MS);
