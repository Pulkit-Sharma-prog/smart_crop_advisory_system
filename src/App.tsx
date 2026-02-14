import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import CopilotWidget from "./components/CopilotWidget";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { routes } from "./types/routes";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WeatherAdvisory = lazy(() => import("./pages/WeatherAdvisory"));
const SoilCropRecommendation = lazy(() => import("./pages/SoilCropRecommendation"));
const DiseaseDetection = lazy(() => import("./pages/DiseaseDetection"));
const FarmingSchedule = lazy(() => import("./pages/FarmingSchedule"));
const MarketPrices = lazy(() => import("./pages/MarketPrices"));
const FarmTools = lazy(() => import("./pages/FarmTools"));

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col app-shell">
      <div className="content-layer">
        <Navbar />
        <main className="flex-1" role="main">
          <Suspense
            fallback={
              <div className="max-w-7xl mx-auto p-6">
                <div className="surface-card-strong p-6 text-forest-800 animate-pulse">{t("app.loadingPage")}</div>
              </div>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <Routes location={location}>
                  <Route path={routes.home} element={<LandingPage />} />
                  <Route path={routes.login} element={<LoginPage />} />

                  <Route path={routes.dashboard} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path={routes.weather} element={<ProtectedRoute><WeatherAdvisory /></ProtectedRoute>} />
                  <Route path={routes.advisory} element={<ProtectedRoute><SoilCropRecommendation /></ProtectedRoute>} />
                  <Route path={routes.diseaseDetection} element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
                  <Route path={routes.farmingSchedule} element={<ProtectedRoute><FarmingSchedule /></ProtectedRoute>} />
                  <Route path={routes.marketPrices} element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
                  <Route path={routes.farmTools} element={<ProtectedRoute><FarmTools /></ProtectedRoute>} />

                  <Route path="*" element={<Navigate to={isAuthenticated ? routes.dashboard : routes.home} replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
        <Footer />
        {isAuthenticated ? <CopilotWidget /> : null}
      </div>
    </div>
  );
}

export default App;
