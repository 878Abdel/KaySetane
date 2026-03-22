import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/KaySetane_LandingPage";
import Dashboard from "./pages/KaySetane_Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil */}
        <Route path="/" element={<LandingPage />} />

        {/* App */}
        <Route path="/KaySetane" element={<Dashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}