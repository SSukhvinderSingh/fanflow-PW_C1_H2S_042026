// ============================================================
// FanFlow — Mock Data: Narendra Modi Stadium, Ahmedabad
// World's largest cricket stadium | Capacity: 132,000
// Coordinates: 23.0902° N, 72.0851° E
// ============================================================

export const venueConfig = {
  name: "Narendra Modi Stadium",
  city: "Ahmedabad, Gujarat, India",
  capacity: 132000,
  eventEndTime: "22:00",
  center: { lat: 23.0914, lng: 72.5972 },
};

// --- VENUE ZONES (Stands) ---
export const venueZones = [
  { id: "zone_adani",    name: "Adani End (North)",   lat: 23.0932, lng: 72.5972, crowdLevel: "low",    current: 8500,  capacity: 33000, crowdDensity: 26 },
  { id: "zone_reliance", name: "Reliance End (South)", lat: 23.0896, lng: 72.5972, crowdLevel: "medium", current: 18000, capacity: 33000, crowdDensity: 55 },
  { id: "zone_east",     name: "East Stand",           lat: 23.0914, lng: 72.5997, crowdLevel: "medium", current: 15000, capacity: 33000, crowdDensity: 45 },
  { id: "zone_west",     name: "West Stand (VIP)",     lat: 23.0914, lng: 72.5947, crowdLevel: "low",    current: 9000,  capacity: 33000, crowdDensity: 27 },
];

// --- ENTRY / EXIT GATES ---
export const venueGates = [
  { id: "gate_a", name: "Gate A — North Main",  lat: 23.0942, lng: 72.5972, waitTime: 4,  crowdLevel: "low",    crowdDensity: 20 },
  { id: "gate_b", name: "Gate B — North East",  lat: 23.0933, lng: 72.5997, waitTime: 7,  crowdLevel: "medium", crowdDensity: 45 },
  { id: "gate_c", name: "Gate C — South East",  lat: 23.0895, lng: 72.5997, waitTime: 12, crowdLevel: "medium", crowdDensity: 60 },
  { id: "gate_d", name: "Gate D — South Main",  lat: 23.0886, lng: 72.5972, waitTime: 18, crowdLevel: "high",   crowdDensity: 80 },
  { id: "gate_e", name: "Gate E — South West",  lat: 23.0895, lng: 72.5947, waitTime: 9,  crowdLevel: "medium", crowdDensity: 50 },
  { id: "gate_f", name: "Gate F — North West",  lat: 23.0933, lng: 72.5947, waitTime: 3,  crowdLevel: "low",    crowdDensity: 18 },
];

// --- CONCESSION STANDS ---
export const venueConcessions = [
  { id: "conc_1", name: "North Concourse — Stall 1", waitTime: 5,  crowdLevel: "low",    lastUpdated: Date.now() },
  { id: "conc_2", name: "North Concourse — Stall 2", waitTime: 8,  crowdLevel: "medium", lastUpdated: Date.now() },
  { id: "conc_3", name: "East Concourse — Stall 1",  waitTime: 14, crowdLevel: "medium", lastUpdated: Date.now() },
  { id: "conc_4", name: "East Concourse — Stall 2",  waitTime: 22, crowdLevel: "high",   lastUpdated: Date.now() },
  { id: "conc_5", name: "South Concourse — Stall 1", waitTime: 6,  crowdLevel: "low",    lastUpdated: Date.now() },
  { id: "conc_6", name: "West Concourse (VIP)",       waitTime: 2,  crowdLevel: "low",    lastUpdated: Date.now() },
];

// --- RESTROOM BLOCKS ---
export const venueRestrooms = [
  { id: "rest_1", name: "North Block — Restrooms", waitTime: 3,  crowdLevel: "low",    lastUpdated: Date.now() },
  { id: "rest_2", name: "East Block — Restrooms",  waitTime: 11, crowdLevel: "medium", lastUpdated: Date.now() },
  { id: "rest_3", name: "South Block — Restrooms", waitTime: 16, crowdLevel: "high",   lastUpdated: Date.now() },
  { id: "rest_4", name: "West Block — Restrooms",  waitTime: 4,  crowdLevel: "low",    lastUpdated: Date.now() },
];

// Legacy export aliases — preserve existing page import names
export const gates = venueGates;
export const concessions = venueConcessions;
export const restrooms = venueRestrooms;

export const menuItems = [
  { id: "m01", name: "Samosa (2 pcs)",     category: "Snacks",   price: 60,   description: "Crispy fried pastry with spiced filling" },
  { id: "m02", name: "Vada Pav",           category: "Snacks",   price: 50,   description: "Mumbai's iconic street burger" },
  { id: "m03", name: "Pav Bhaji",          category: "Mains",    price: 120,  description: "Spiced vegetable mash with buttered bread" },
  { id: "m04", name: "Chicken Biryani",    category: "Mains",    price: 220,  description: "Aromatic basmati rice with chicken" },
  { id: "m05", name: "Paneer Wrap",        category: "Mains",    price: 150,  description: "Grilled paneer in a soft flour wrap" },
  { id: "m06", name: "Cold Coffee",        category: "Drinks",   price: 80,   description: "Chilled coffee with milk" },
  { id: "m07", name: "Lime Soda",          category: "Drinks",   price: 50,   description: "Fresh lime with soda water" },
  { id: "m08", name: "Bottled Water",      category: "Drinks",   price: 20,   description: "500ml sealed mineral water" },
  { id: "m09", name: "Gulab Jamun",        category: "Desserts", price: 70,   description: "Soft milk-solid balls in rose syrup" },
  { id: "m10", name: "Ice Cream Cup",      category: "Desserts", price: 60,   description: "Vanilla & chocolate cup" },
  { id: "m11", name: "Nachos & Dip",       category: "Snacks",   price: 110,  description: "Crispy tortilla chips with salsa" },
  { id: "m12", name: "Masala Chai",        category: "Drinks",   price: 30,   description: "Spiced Indian milk tea" },
];
