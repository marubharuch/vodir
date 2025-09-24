// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import CombinedForm from "../components/CombinedForm";
import CityRibbon from "../components/CityRibbon";
import Carousel from "../components/Carousel";
import CardList from "../components/CardList";
import { images, cards } from "../data/carouselData";

const HomePage = () => {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);

  // Wait until user state is loaded
  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  if (!user)
    return (
      <div className="p-6 text-center text-red-500">
        You are not logged in.
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* --- Top greeting + logout --- */}
      <div className="p-4 bg-white shadow-md flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">
          Welcome, {user.displayName || user.email} 🎉
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* --- Ribbon --- */}
      <CityRibbon />
{/*
      
      <Carousel images={images} />

    
      <CardList cards={cards} /> */}

      {/* --- Profile Section --- */}
      <div className="p-4">
        {profile ? (
          <div className="mb-4 p-3 border rounded bg-gray-50">
            <p>
              <strong>Native City:</strong> {profile.nativeCity}
            </p>
            <p>
              <strong>Current City:</strong> {profile.currentCity}
            </p>
            <p>
              <strong>Members:</strong> {profile.members?.length || 0}
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              No profile saved yet. Add your details below.
            </p>
            <CombinedForm />
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
