// src/pages/HomePage.jsx

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
//import SyncButton from "../components/SyncButton";

export default function HomePage() {
  const { user, login, logout } = useAuth();
  const { profile, updateProfile, clearProfile } = useProfile();

  return (
    <div className="p-4">
      <h1 className="text-xl">Welcome {user ? user.email : "Guest"}</h1>

      <button
        className="bg-blue-500 text-white px-3 py-1 m-2"
        onClick={() =>
          login({ uid: "123", email: "test@example.com", role: "member" })
        }
      >
        Login
      </button>
      <button className="bg-red-500 text-white px-3 py-1 m-2" onClick={logout}>
        Logout
      </button>

      <h2 className="text-lg mt-4">Profile</h2>
      {profile ? (
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      ) : (
        <p>No profile saved</p>
      )}

      <button
        className="bg-green-500 text-white px-3 py-1 m-2"
        onClick={() => updateProfile({ name: "Sanjay 2", city: "Ahmedabad" })}
      >
        Save Profile
      </button>
      <button className="bg-gray-500 text-white px-3 py-1 m-2" onClick={clearProfile}>
        Clear Profile
      </button>

      <hr className="my-4" />

    { /* <SyncButton />*/
}    </div>
  );
}




//===== old page with carousel ribine etc

{/*import React from 'react';
import CityRibbon from '../components/CityRibbon';
import Carousel from '../components/Carousel';
import CardList from '../components/CardList';
import { images, cards } from '../data/carouselData';
const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <CityRibbon/>
      
    <Carousel images={images} />
    <CardList cards={cards} />
  


  </div>
  );
};

export default HomePage;*/}
