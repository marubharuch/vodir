// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { Link, useNavigate } from "react-router-dom";
import localforage from "localforage";

import CityRibbon from "../components/CityRibbon";
import TeamDirectory from "./TeamDirectory";
import DirectoryNoticeModal from "../components/DirectoryNoticeModal";

const HomePage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  /* --------------------------------------------------------
     1️⃣ Stop showing "loading" as soon as user is available
  -------------------------------------------------------- */
  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  /* --------------------------------------------------------
     2️⃣ Popup Logic: Show only for NEW users
     - Only show if user logged in
     - Only show if NO familySrno/profile.id
     - Only if user has NOT closed popup before
  -------------------------------------------------------- */
  useEffect(() => {
    async function checkPopup() {
      if (!user) return;

      const dismissed = await localforage.getItem("noticeDismissed");
     // if (dismissed) return; // user already dismissed popup

      // show popup ONLY when profile not created
      if (!profile?.id) {
        setShowPopup(true);
      }
    }

    checkPopup();
  }, [user, profile]);

  /* --------------------------------------------------------
     3️⃣ Close popup & store dismissal
  -------------------------------------------------------- */
  const handleClosePopup = async () => {
    setShowPopup(false);
    await localforage.setItem("noticeDismissed", true);
  };

  /* --------------------------------------------------------
     4️⃣ Show loading / login message
  -------------------------------------------------------- */
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-indigo-600">
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-600">
        You are not logged in.
      </div>
    );

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "સભ્ય";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
<p className="text-xs text-gray-500">
  Version: {__APP_VERSION__}
</p>
      {/* 🔥 Popup */}
      <DirectoryNoticeModal
        show={showPopup}
        onClose={handleClosePopup}
      />

      {/* --- City Ribbon at top --- */}
      <CityRibbon />

      {/* --- Header --- */}
      <header className="sticky top-0 z-10 bg-white shadow-lg p-3 sm:px-6 flex items-center justify-between border-b border-gray-200">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">
            👋 Welcome, {displayName}!
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            {user?.email}
          </p>
        </div>
      </header>

      {/* --- Page Body --- */}
      <main className="p-4 sm:p-6 flex-1">

        <div className="mb-6">
                    
          <p className="text-m font-bold text-indigo-800 mt-4">
            <Link
              to="/voice"
              className="text-blue-600 underline hover:text-blue-800 transition"
            >
              Click here to Add/Update your family
            </Link>
          </p>
        </div>

        <div className="mt-1">
          <TeamDirectory />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
