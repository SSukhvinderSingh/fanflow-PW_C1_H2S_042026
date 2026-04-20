import React, { useState, useEffect } from "react";
import { GoogleMap, HeatmapLayer, Marker } from "@react-google-maps/api";
import { useMap } from "../context/MapProvider";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { venueConfig, venueZones as mockZones } from "../data/mockData";
import { X, Users, LocateFixed } from "lucide-react";
import Layout from "../components/layout/Layout";

const LIBRARIES = ["visualization"];

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 120px)", // Adjusting for header/footer
};

const VenueMap = () => {
  const { isLoaded } = useMap();

  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    // Seed immediately with mock data so map always shows something
    setZones(mockZones);

    // Then listen to Firebase RTDB for real-time zone data
    const zoneRef = ref(db, "/zones");
    const unsub = onValue(
      zoneRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setZones(Array.isArray(data) ? data : Object.values(data));
        }
        // If null (empty), keep the mock data already set above
      },
      (error) => {
        // Permission denied or network error — keep mock data
        console.warn("RTDB read failed (using mock data):", error.code);
      }
    );

    // Attempt to fetch device geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Could not fetch user location", error);
          setUserLocation({
            lat: venueConfig.center.lat - 0.002,
            lng: venueConfig.center.lng + 0.002
          });
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setUserLocation({
        lat: venueConfig.center.lat - 0.002,
        lng: venueConfig.center.lng + 0.002
      });
    }

    return () => unsub();
  }, []);

  const handleCenterUser = () => {
    if (!mapInstance) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          mapInstance.panTo(loc);
          mapInstance.setZoom(17);
        },
        (error) => {
          console.warn("Location error:", error);
          const mockLoc = {
            lat: venueConfig.center.lat - 0.002,
            lng: venueConfig.center.lng + 0.002
          };
          setUserLocation(mockLoc);
          mapInstance.panTo(mockLoc);
          mapInstance.setZoom(17);
          alert("Using simulated location. Live GPS could not be securely fetched.");
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full pt-32 text-gray-500 font-medium">
          Loading Map...
        </div>
      </Layout>
    );
  }

  // Format data for HeatmapLayer — only safe after Google Maps SDK is loaded
  const heatmapData = zones.map((zone) => ({
    location: new window.google.maps.LatLng(zone.lat, zone.lng),
    weight: zone.crowdLevel === "high" ? 3 : zone.crowdLevel === "medium" ? 2 : 1,
  }));

  // Helper to determine marker colors
  const getMarkerIcon = (crowdLevel) => {
    let color = "#10B981"; // Green (low)
    if (crowdLevel === "medium") color = "#F59E0B"; // Amber
    if (crowdLevel === "high") color = "#EF4444"; // Red

    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: "#ffffff",
      scale: 1.5,
      anchor: new window.google.maps.Point(12, 24),
    };
  };


  return (
    <Layout>
      <div className="relative h-full w-full flex-grow">
        <GoogleMap 
          mapContainerStyle={mapContainerStyle} 
          center={venueConfig.center} 
          zoom={17} 
          options={{ disableDefaultUI: true }}
          onLoad={(map) => setMapInstance(map)}
        >
          {zones.length > 0 && <HeatmapLayer data={heatmapData} options={{ radius: 40, opacity: 0.6 }} />}

          {zones.map((zone) => (
            <Marker
              key={zone.id}
              position={{ lat: zone.lat, lng: zone.lng }}
              icon={getMarkerIcon(zone.crowdLevel)}
              title={zone.name}
              onClick={() => setSelectedZone(zone)}
            />
          ))}
          
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff",
              }}
              title="You are here"
              zIndex={999}
            />
          )}
        </GoogleMap>

        {/* Floating Controls always visible, requests loc on click */}
        <button
          onClick={handleCenterUser}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-brand z-10 text-brand"
          aria-label="Center map on my location"
        >
          <LocateFixed size={20} aria-hidden="true" />
        </button>

        {/* Map Legend */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl shadow-black/5 border border-white/50 dark:border-white/5 z-10 animate-in fade-in slide-in-from-left duration-500 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </div>
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Live Density</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/40"></div> Low
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/40"></div> Medium
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/40"></div> High
            </div>
          </div>
        </div>

        {/* Slide-up Detail Panel */}
        <div
          className={`fixed bottom-[60px] left-0 w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
            selectedZone ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
          style={{ zIndex: 40 }}
        >
          {selectedZone && (
            <div className="p-8 pb-10">
              {/* Handle for visual cue */}
              <div className="w-12 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{selectedZone.name}</h2>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        selectedZone.crowdLevel === "high"
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                          : selectedZone.crowdLevel === "medium"
                          ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                          : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30"
                      }`}
                    >
                      {selectedZone.crowdLevel} Density
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="bg-gray-50 dark:bg-white/5 p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors active:scale-90"
                  aria-label="Close details"
                >
                  <X size={18} className="text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/80 dark:bg-white/5 p-5 rounded-2xl border border-gray-100/50 dark:border-white/5">
                  <div className="bg-brand/10 dark:bg-brand/20 w-10 h-10 rounded-xl flex items-center justify-center text-brand mb-3">
                    <Users size={20} aria-hidden="true" />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Present</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{selectedZone.current}</p>
                </div>
                
                <div className="bg-gray-50/80 dark:bg-white/5 p-5 rounded-2xl border border-gray-100/50 dark:border-white/5">
                  <div className="bg-emerald-100 dark:bg-emerald-900/20 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                    <LocateFixed size={20} aria-hidden="true" />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Capacity</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{selectedZone.capacity}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default VenueMap;
