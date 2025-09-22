// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import InstallButton from './InstallButton';
import BottomNav from './components/BottomNav';
import HousieUser from './housie/HousieUser';
import HousieAdmin from './housie/HousieAdmin';
import FamilyPage from './pages/FamilyPage';
import CombinedForm from './components/CombinedForm';

import { AuthProvider } from './context/AuthContext'     // ✅ new
import { ProfileProvider } from './context/ProfileContext'; // ✅ new

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <div className="max-w-md mx-auto p-4 pb-24">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/housie" element={<HousieUser />} />
            <Route path="/housieadmin" element={<HousieAdmin />} />
            <Route path="/family" element={<FamilyPage />} />
            <Route path="/voice" element={<CombinedForm />} />
          </Routes>
          <InstallButton />
          <BottomNav />
        </div>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
