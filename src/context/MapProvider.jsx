import React, { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const MapContext = createContext({ isLoaded: false });

const LIBRARIES = ["visualization", "places"];

export const MapProvider = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-6 text-center">
        <div>
          <h1 className="text-2xl font-black mb-2 italic uppercase">MAP_LOAD_ERROR</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Internal script injection failed. Check VITE_GOOGLE_MAPS_API_KEY.</p>
        </div>
      </div>
    );
  }

  return (
    <MapContext.Provider value={{ isLoaded }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => useContext(MapContext);
