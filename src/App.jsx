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
import CombinedForm from "./components/CombinedForm";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider, useAuth } from "./context/AuthContext"; // ✅ useAuth hook
import { ProfileProvider } from "./context/ProfileContext";

// ✅ Wrapper to protect routes
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <div className="max-w-md mx-auto p-4 pb-24">
          <Navbar />
          <Routes>
            {/* ✅ Protect homepage */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />

            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />

<Route
  path="/profile"
  element={
    <PrivateRoute>
      <ProfilePage />
    </PrivateRoute>
  }
/>

            {/* Other routes (you can also protect them if needed) */}
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
