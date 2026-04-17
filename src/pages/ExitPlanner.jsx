import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { gates as mockGates, venueConfig } from "../data/mockData";
import { Navigation, Clock, CheckCircle } from "lucide-react";
import Layout from "../components/layout/Layout";

const LIBRARIES = ["places"];
const MODES = ["Walking", "Driving", "Transit", "Rideshare"];

// Helper: Calculate staggered exit time
const calculateStaggeredTime = (endTimeStr, waitMins) => {
  const [h, m] = endTimeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0);
  date.setMinutes(date.getMinutes() - waitMins);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ExitPlanner = () => {
  const [gates, setGates] = useState([]);
  const [selectedMode, setSelectedMode] = useState("Walking");
  const [destination, setDestination] = useState("Union Square, San Francisco"); // Preset string destination
  const [directions, setDirections] = useState(null);
  const [staggerInfo, setStaggerInfo] = useState(null);
  const [bestGate, setBestGate] = useState(null);

  // 1. Fetch gates real-time
  useEffect(() => {
    const unsub = onValue(ref(db, "/gates"), (snapshot) => {
      const data = snapshot.val();
      setGates(data ? Object.values(data) : mockGates);
    }, { onlyOnce: true });
    return () => unsub();
  }, []);

  // 2. Recommend optimal gate and calculate staggered logic
  useEffect(() => {
    if (!gates.length) return;

    // Filter gates by recommended mode (if mock supports it, or generic)
    // Find gate with lowest crowd density
    const transportGates = gates.filter(g => g.recommendedFor === selectedMode || g.recommendedFor === "Walking");
    const validGates = transportGates.length ? transportGates : gates;

    let optimal = validGates[0];
    for (const g of validGates) {
      if (g.crowdDensity < optimal.crowdDensity) {
        optimal = g;
      }
    }
    
    // Slight jitter to give variation to mapping coordinates (since mocked gates have no hard lat/lng)
    const indexStr = optimal.id.replace('g','');
    const idx = parseInt(indexStr) || 1;
    const gateCoords = { 
      lat: venueConfig.center.lat + (idx % 2 === 0 ? 0.002 : -0.002), 
      lng: venueConfig.center.lng + (idx % 3 === 0 ? 0.002 : -0.002) 
    };
    
    setBestGate({ ...optimal, coords: gateCoords });

    if (optimal.crowdDensity > 70) {
      setStaggerInfo(`Leave by ${calculateStaggeredTime(venueConfig.eventEndTime, 10)} (10 mins early) to avoid severe bottlenecking.`);
    } else if (optimal.crowdDensity > 40) {
      setStaggerInfo(`Leave by ${calculateStaggeredTime(venueConfig.eventEndTime, 5)} (5 mins early) for a smoother exit.`);
    } else {
      setStaggerInfo(`Stay until the end! Main rush will be manageable at this gate.`);
    }
    
    // Clear old directions on change
    setDirections(null);
  }, [gates, selectedMode]);

  const directionsCallback = useCallback((res, status) => {
    if (status === "OK" && res) {
      // Avoid infinite loops
      if (!directions || directions.routes[0].overview_polyline !== res.routes[0].overview_polyline) {
        setDirections(res);
      }
    } else {
      console.error("Directions lookup failed:", status);
    }
  }, [directions]);

  const mapTravelMode = (modeStr) => {
    if (modeStr === "Walking") return window.google.maps.TravelMode.WALKING;
    if (modeStr === "Transit") return window.google.maps.TravelMode.TRANSIT;
    return window.google.maps.TravelMode.DRIVING; // Rideshare & Driving
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-gray-50 pb-16">
        
        {/* Planner Dashboard */}
        <div className="p-4 bg-white shadow-sm z-10 relative">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Smart Exit Planner</h1>
          
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" id="mode-label">Transport Mode</label>
          <div className="grid grid-cols-2 gap-2 mb-4" role="group" aria-labelledby="mode-label">
            {MODES.map(mode => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                aria-pressed={selectedMode === mode}
                className={`py-2 px-3 rounded-lg text-sm transition font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 ${
                  selectedMode === mode ? "bg-brand text-white shadow-md" : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <label htmlFor="destination-input" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Destination</label>
          <input
            id="destination-input"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand/50 mb-4"
            placeholder="E.g., Train Station, Hotel"
          />

          {bestGate && (
            <div className="bg-brand/5 border border-brand/20 p-4 rounded-xl" aria-live="polite">
              <div className="flex items-start gap-3">
                <Navigation className="text-brand shrink-0 mt-1" size={20} aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Recommended Exit: {bestGate.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Current congestion: {bestGate.crowdDensity}%</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-brand/10 flex items-start gap-3">
                <Clock className="text-brand shrink-0 mt-1" size={20} aria-hidden="true" />
                <p className="font-medium text-brand text-sm">{staggerInfo}</p>
              </div>
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="flex-grow w-full relative min-h-[400px]">
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={LIBRARIES}>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              zoom={14}
              center={venueConfig.center}
              options={{ disableDefaultUI: true, gestureHandling: "greedy" }}
            >
              {bestGate && destination && window.google && (
                <DirectionsService
                  options={{
                    origin: bestGate.coords,
                    destination: destination,
                    travelMode: mapTravelMode(selectedMode),
                  }}
                  callback={directionsCallback}
                />
              )}
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    polylineOptions: { strokeColor: "#1D4ED8", strokeWeight: 5 },
                    suppressMarkers: false,
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
          
          {directions && directions.routes[0]?.legs[0] && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Estimated Trip</p>
                <p className="font-bold text-gray-900 text-lg">{directions.routes[0].legs[0].duration.text}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Distance</p>
                <p className="font-bold text-gray-900 text-lg">{directions.routes[0].legs[0].distance.text}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExitPlanner;
