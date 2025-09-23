
// HomePage.jsx
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { user, logout } = useAuth();

  if (!user) return <div>Please log in.</div>;

  return (
    <div className="p-4">
      <h1>Welcome, {user.email} 🎉</h1>
      
      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default HomePage;




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
