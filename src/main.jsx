import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import "./styles/immersive.css";
import Layout from "./components/Layout.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { SecretsProvider } from "./secrets/SecretsProvider.jsx";
import { ProgressProvider } from "./progress/ProgressProvider.jsx";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import Home from "./pages/Home.jsx";

/* Routes are split so the homepage doesn't ship the game code. */
const Characters = lazy(() => import("./pages/Characters.jsx"));
const CharacterDetail = lazy(() => import("./pages/CharacterDetail.jsx"));
const Games = lazy(() => import("./pages/Games.jsx"));
const GameDetail = lazy(() => import("./pages/GameDetail.jsx"));
const Play = lazy(() => import("./pages/Play.jsx"));
const WebGame = lazy(() => import("./pages/WebGame.jsx"));
const Lore = lazy(() => import("./pages/Lore.jsx"));
const Media = lazy(() => import("./pages/Media.jsx"));
const Community = lazy(() => import("./pages/Community.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Oversight = lazy(() => import("./pages/Oversight.jsx"));
const Secrets = lazy(() => import("./pages/Secrets.jsx"));
const SecretTracker = lazy(() => import("./pages/SecretTracker.jsx"));
const ServiceRecord = lazy(() => import("./pages/ServiceRecord.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function Loading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="route-loading-monitor" aria-hidden="true">
        <span className="route-loading-rec">● REC</span>
        <span className="route-loading-static" />
        <span className="route-loading-cam">CAM 01</span>
      </div>
      <div className="route-loading-bar" />
      <div className="route-loading-text">CONNECTING TO CAMERA…</div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <SecretsProvider>
        <ProgressProvider>
          <AuthProvider>
            <ErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/characters" element={<Characters />} />
                    <Route path="/characters/:id" element={<CharacterDetail />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/games/:id" element={<GameDetail />} />
                    <Route path="/play" element={<Play />} />
                    <Route path="/play/web/:slug" element={<WebGame />} />
                    <Route path="/arcade" element={<Navigate to="/play" replace />} />
                    {/* Retired exhibits — kept as redirects so old links never 404. */}
                    <Route path="/cameras" element={<Navigate to="/play" replace />} />
                    <Route path="/night" element={<Navigate to="/play" replace />} />
                    <Route path="/lore" element={<Lore />} />
                    <Route path="/media" element={<Media />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/staff" element={<Navigate to="/login" replace />} />
                    <Route path="/admin" element={<Oversight />} />
                    <Route path="/secrets" element={<Secrets />} />
                    <Route path="/vault" element={<SecretTracker />} />
                    <Route path="/achievements" element={<ServiceRecord />} />
                    <Route path="/record" element={<Navigate to="/achievements" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </AuthProvider>
        </ProgressProvider>
      </SecretsProvider>
    </HashRouter>
  </StrictMode>
);
