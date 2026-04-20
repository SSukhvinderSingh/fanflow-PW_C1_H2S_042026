import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import "./index.css"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./auth/ProtectedRoute"
import Login from "./pages/Login"
import VenueMap from "./pages/VenueMap"
import WaitTimes from "./pages/WaitTimes"
import FoodOrder from "./pages/FoodOrder"
import ExitPlanner from "./pages/ExitPlanner"
import { MapProvider } from "./context/MapProvider"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <MapProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/map" element={<ProtectedRoute><VenueMap /></ProtectedRoute>} />
            <Route path="/waittimes" element={<ProtectedRoute><WaitTimes /></ProtectedRoute>} />
            <Route path="/order" element={<ProtectedRoute><FoodOrder /></ProtectedRoute>} />
            <Route path="/exit" element={<ProtectedRoute><ExitPlanner /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/map" />} />
          </Routes>
        </BrowserRouter>
      </MapProvider>
    </AuthProvider>
  </React.StrictMode>
)
