export const venueConfig = {
  name: "FanFlow Venue",
  center: { lat: 37.7749, lng: -122.4194 },
  eventEndTime: "22:00",
};

export const concessions = Array.from({ length: 30 }).map((_, i) => ({
  id: `c${i+1}`,
  name: `Concession Stand ${i+1}`,
  zone: `Zone ${Math.floor(i/4) + 1}`,
  waitMinutes: Math.floor(Math.random() * 25),
  crowdLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
  lastUpdated: new Date().toLocaleTimeString()
}));

export const restrooms = Array.from({ length: 30 }).map((_, i) => ({
  id: `r${i+1}`,
  name: `Restroom ${i+1}`,
  zone: `Zone ${Math.floor(i/4) + 1}`,
  queueLength: Math.floor(Math.random() * 20),
  crowdLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
  lastUpdated: new Date().toLocaleTimeString()
}));

export const gates = Array.from({ length: 30 }).map((_, i) => ({
  id: `g${i+1}`,
  name: `Gate ${i+1}`,
  zone: `Zone ${Math.floor(i/4) + 1}`,
  crowdDensity: Math.floor(Math.random() * 100),
  recommendedFor: ["Walking", "Transit", "Driving"][Math.floor(Math.random() * 3)],
  lastUpdated: new Date().toLocaleTimeString()
}));

const subCats = ["Snacks", "Drinks", "Mains", "Desserts"];
export const menuItems = Array.from({ length: 40 }).map((_, i) => ({
  id: `m${i+1}`,
  name: `Item ${i+1}`,
  category: subCats[i % 4],
  price: (Math.random() * 15 + 2).toFixed(2),
  available: true,
  imageUrl: `https://via.placeholder.com/150?text=Item+${i+1}`
}));

export const venueZones = Array.from({ length: 20 }).map((_, i) => ({
  id: `z${i+1}`,
  name: `Zone ${i+1}`,
  lat: 37.7749 + (Math.random() - 0.5) * 0.01,
  lng: -122.4194 + (Math.random() - 0.5) * 0.01,
  crowdLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
  capacity: 1000,
  current: Math.floor(Math.random() * 1000)
}));
