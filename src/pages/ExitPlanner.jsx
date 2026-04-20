import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { useMap } from "../context/MapProvider";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { gates as mockGates, venueConfig } from "../data/mockData";
import { Navigation, Clock, CheckCircle } from "lucide-react";
import Layout from "../components/layout/Layout";
import { calculateStaggeredTime } from "../utils/exitUtils";

const LIBRARIES = ["places"];
const MODES = ["Walking", "Driving", "Transit", "Rideshare"];


const ExitPlanner = () => {
  const { isLoaded } = useMap();
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
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-500">
        
        {/* Planner Dashboard */}
        <div className="p-6 bg-white dark:bg-slate-900 z-10 relative rounded-b-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-black/20 border-b border-gray-100 dark:border-white/5">
          <header className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Smart Exit</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2rem] mt-1">AI-Powered Departure routes</p>
          </header>
          
          <div className="mb-6">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3" id="mode-label">Select Transport</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" role="group" aria-labelledby="mode-label">
              {MODES.map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  aria-pressed={selectedMode === mode}
                  className={`py-3 px-5 rounded-[1.25rem] text-xs transition-all duration-300 font-black uppercase tracking-wider whitespace-nowrap ${
                    selectedMode === mode 
                      ? "bg-brand text-white shadow-xl shadow-brand/20 scale-105" 
                      : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="destination-input" className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Destination</label>
            <div className="relative group">
              <input
                id="destination-input"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[1.25rem] p-4 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
                placeholder="Where to next?"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-brand transition-colors">
                <Navigation size={18} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {bestGate && (
            <div className="relative overflow-hidden bg-brand/5 dark:bg-brand/10 border border-brand/10 dark:border-brand/20 p-5 rounded-[2rem] animate-in fade-in slide-in-from-top duration-500" aria-live="polite">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 dark:bg-brand/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="flex items-start gap-4">
                <div className="bg-brand/10 dark:bg-brand/20 p-3 rounded-2xl text-brand">
                  <Navigation size={20} strokeWidth={2.5} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-base uppercase tracking-tight italic">Gate {bestGate.name.replace('Gate ', '')}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{bestGate.crowdDensity}% Congestion</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand/10 dark:border-brand/20 flex items-start gap-4">
                <div className="bg-brand/10 dark:bg-brand/20 p-3 rounded-2xl text-brand">
                  <Clock size={20} strokeWidth={2.5} aria-hidden="true" />
                </div>
                <p className="font-bold text-gray-900 dark:text-gray-200 text-sm leading-relaxed">{staggerInfo}</p>
              </div>
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="flex-grow w-full relative min-h-[350px] shadow-inner lg:rounded-t-[3rem] overflow-hidden">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-950 text-gray-400 font-bold uppercase tracking-widest text-xs">
              Initializing Engine...
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              zoom={14}
              center={venueConfig.center}
              options={{ 
                disableDefaultUI: true, 
                gestureHandling: "greedy",
                styles: window.matchMedia('(prefers-color-scheme: dark)').matches ? [
                  { elementType: "geometry", stylers: [{ color: "#212121" }] },
                  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
                  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
                  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181818" }] },
                  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
                  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
                ] : [
                  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }] }
                ]
              }}
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
                    polylineOptions: { 
                      strokeColor: "#1D4ED8", 
                      strokeWeight: 6,
                      strokeOpacity: 0.8
                    },
                    suppressMarkers: false,
                  }}
                />
              )}
            </GoogleMap>
          )}
          
          {directions && directions.routes[0]?.legs[0] && (
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 flex items-center justify-between animate-in slide-in-from-bottom duration-700">
              <div className="flex items-center gap-4">
                <div className="bg-brand p-3 rounded-2xl text-white shadow-lg shadow-brand/30">
                  <Navigation size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2rem] mb-0.5">Est. Arrival</p>
                  <p className="font-black text-gray-900 dark:text-white text-2xl tracking-tighter italic">{directions.routes[0].legs[0].duration.text}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2rem] mb-0.5">Trip Length</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">{directions.routes[0].legs[0].distance.text}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExitPlanner;
