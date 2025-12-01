import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import InstallButton from "./InstallButton";
import BottomNav from "./components/BottomNav";
import HousieUser from "./housie/HousieUser";
import HousieAdmin from "./housie/HousieAdmin";
import FamilyPage from "./pages/FamilyPage";
import TeamDirectory from "./pages/TeamDirectory";
import BoardsPage from "./pages/Boards";
import CombinedForm from "./components/CombinedForm/CombinedForm";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { useRegisterSW } from "virtual:pwa-register/react";

// 🔒 Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {

  // ⭐ MUST BE INSIDE FUNCTION COMPONENT
  const intervalMS = 60 * 60 * 1000; // every 1 hr check

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      setInterval(() => {
        registration && registration.update();
      }, intervalMS);
    },
  });

  return (
    <AuthProvider>
      <ProfileProvider>
        <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto p-4 pb-24">

          {/* ⭐ Update Popup */}
          {needRefresh && (
            <div className="fixed bottom-4 right-4 bg-white border shadow-lg p-4 rounded-xl z-50">
              <p className="font-semibold text-gray-800">New version available</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setNeedRefresh(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Later
                </button>
                <button
                  onClick={() => updateServiceWorker(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Update Now
                </button>
              </div>
            </div>
          )}

          <Navbar />

          <Routes>

            {/* Secured Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/team" element={<TeamDirectory />} />

            {/* More Secured Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />

            <Route
              path="/housie"
              element={
                <PrivateRoute>
                  <HousieUser />
                </PrivateRoute>
              }
            />

            <Route
              path="/housieadmin"
              element={
                <PrivateRoute>
                  <HousieAdmin />
                </PrivateRoute>
              }
            />

            <Route
              path="/family"
              element={
                <PrivateRoute>
                  <FamilyPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/boards"
              element={
                <PrivateRoute>
                  <BoardsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/voice"
              element={
                <PrivateRoute>
                  <CombinedForm />
                </PrivateRoute>
              }
            />

          </Routes>

          <InstallButton />
          <BottomNav />

        </div>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
