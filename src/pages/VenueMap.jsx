import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, HeatmapLayer, Marker } from "@react-google-maps/api";
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
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

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
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-100 text-xs font-medium z-10">
          <h3 className="mb-2 text-gray-500 uppercase tracking-wider">Crowd Density</h3>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div> Low
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div> Medium
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div> High
          </div>
        </div>

        {/* Slide-up Detail Panel */}
        <div
          className={`fixed bottom-[60px] left-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 transform ${
            selectedZone ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ zIndex: 40 }}
        >
          {selectedZone && (
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedZone.name}</h2>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedZone.crowdLevel === "high"
                        ? "bg-red-100 text-red-800"
                        : selectedZone.crowdLevel === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedZone.crowdLevel} Density
                  </span>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-brand"
                  aria-label="Close details"
                >
                  <X size={20} className="text-gray-500" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="bg-brand/10 p-3 rounded-lg text-brand">
                  <Users size={24} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Current Capacity</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedZone.current} / {selectedZone.capacity}
                  </p>
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
