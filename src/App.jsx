import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ControllerLayout from "./components/common/ControllerLayout.jsx";
import Dashboard from "./pages/controller/Dashboard.jsx";
import TeamConfig from "./pages/controller/TeamConfig.jsx";
import MatchConfig from "./pages/controller/MatchConfig.jsx";
import GameConfig from "./pages/controller/GameConfig.jsx";
import DraftController from "./pages/controller/DraftController.jsx";
import HeroConfig from "./pages/controller/HeroConfig.jsx";
import MapConfig from "./pages/controller/MapConfig.jsx";
import CasterConfig from "./pages/controller/CasterConfig.jsx";
import OverlayLinks from "./pages/controller/OverlayLinks.jsx";
import LoadingOverlay from "./pages/overlays/LoadingOverlay.jsx";
import DraftOverlay from "./pages/overlays/DraftOverlay.jsx";
import LegacyDraftOverlay from "./pages/overlays/LegacyDraftOverlay.jsx";
import GameplayOverlay from "./pages/overlays/GameplayOverlay.jsx";
import ResultsOverlay from "./pages/overlays/ResultsOverlay.jsx";
import MapChangeOverlay from "./pages/overlays/MapChangeOverlay.jsx";
import "./styles/controller.css";

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    const isOverlayRoute = location.pathname.startsWith("/overlay/");
    document.body.classList.toggle("is-overlay-route", isOverlayRoute);
    document.documentElement.classList.toggle("is-overlay-route", isOverlayRoute);

    return () => {
      document.body.classList.remove("is-overlay-route");
      document.documentElement.classList.remove("is-overlay-route");
    };
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/config" replace />} />
      <Route path="/config" element={<ControllerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="teams" element={<TeamConfig />} />
        <Route path="matches" element={<MatchConfig />} />
        <Route path="games" element={<GameConfig />} />
        <Route path="draft" element={<DraftController />} />
        <Route path="heroes" element={<HeroConfig />} />
        <Route path="maps" element={<MapConfig />} />
        <Route path="casters" element={<CasterConfig />} />
        <Route path="overlays" element={<OverlayLinks />} />
      </Route>

      <Route path="/overlay/loading" element={<LoadingOverlay />} />
      <Route path="/overlay/draft" element={<DraftOverlay />} />
      <Route path="/overlay/legacy-draft" element={<LegacyDraftOverlay />} />
      <Route path="/overlay/gameplay" element={<GameplayOverlay />} />
      <Route path="/overlay/results" element={<ResultsOverlay />} />
      <Route path="/overlay/map-change" element={<MapChangeOverlay />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
