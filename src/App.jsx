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
function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/housie" element={<HousieUser />} />
        <Route path="/housieadmin" element={<HousieAdmin />} />
        
        
        
      </Routes>
      <InstallButton/>
      <BottomNav />
    </div>
  );
}

export default App;