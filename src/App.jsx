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
function App() {
  return (
    <div className="max-w-md mx-auto p-4 pb-24" >
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/housie" element={<HousieUser />} />
        <Route path="/housieadmin" element={<HousieAdmin />} />
        <Route path="/family" element={<FamilyPage />} /> {/* ✅ added */}
        <Route path="/voice" element={<CombinedForm/>} /> {/* ✅ added */}
        
    
        
        
        
      </Routes>
      <InstallButton/>
      <BottomNav />
    </div>
  );
}

export default App;