// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import TeamDirectory from "./TeamDirectory";
import CityRibbon from "../components/CityRibbon";
// Removed unused imports: CombinedForm, Carousel, CardList, images, cards

// We can define a simple icon for the Logout button
const LogOutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 ml-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3v-5a3 3 0 013-3h3"
    />
  </svg>
);

const HomePage = () => {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

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

  const displayName = user?.displayName || user?.email?.split('@')[0] || "સભ્ય";
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      {/* --- City Ribbon (Fixed at top) --- */}
      <CityRibbon />

      {/* --- Top Header / Welcome Bar (Sticky) --- */}
      <header className="sticky top-0 z-10 bg-white shadow-lg p-3 sm:px-6 flex items-center justify-between border-b border-gray-200">
        
        {/* Welcome Greeting */}
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">
            👋 Welcome, {displayName}!
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            {user?.email}
          </p>
        </div>

        {/* Logout Button */}
       { /*<button
          onClick={logout}
          className="flex items-center bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md hover:bg-red-600 transition duration-150"
          aria-label="Logout"
        >
          Logout
          <LogOutIcon />
        </button>
*/}      </header>

      {/* --- Main Content Area --- */}
      <main className="p-4 sm:p-6 flex-1">
        
        {/* --- Instructions/Update Card --- */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-indigo-100 mb-6">
            
            {/* Main Instruction Heading */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-3 leading-snug">
                સમાજ ડિરેક્ટરી અપડેટ
            </h2>

            <p className="text-base text-gray-700 mb-4 border-l-4 border-indigo-500 pl-3">
                સમાજની ડિરેક્ટરીને **સાચી અને અપડેટેડ** રાખવું દરેક સભ્યની જવાબદારી છે. આપના સહયોગ અને સક્રિય ભાગીદારી બદલ આભાર.
            </p>

            <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-200">
                <p className="font-semibold text-base text-indigo-700 mb-2">
                    📢 મહત્વપૂર્ણ સૂચના:
                </p>
                <p className="text-sm text-gray-700 mb-2">
                    પ્રથમ તબક્કામાં, આપણે ટેલિફોન/મોબાઇલ ડિરેક્ટરી બનાવી રહ્યા છીએ.
                    <br/>
                    કૃપા કરીને તમારા પરિવારના દરેક સભ્યનું નામ અને મોબાઇલ નંબર ઉમેરો.
                </p>
                <p className="text-sm font-bold text-indigo-800 mt-3">
                    આપના પરિવારનો ડેટા અપડેટ કરવા માટે જમણી બાજુના નીચેના ખૂણામાં **'Family'** બટન પર ક્લિક કરો.
                </p>
            </div>

        </div>

        {/* --- Team Directory / Main App Component --- */}
        <div className="mt-6">
            <TeamDirectory />
        </div>
      </main>
      
      {/* Footer / Navigation (Assuming it's a separate component like bottom navigation) */}
      {/* If this were a full application, a fixed bottom navigation would go here. */}

    </div>
  );
};

export default HomePage;