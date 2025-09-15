// src/pages/HomePage.jsx
import React from 'react';
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

export default HomePage;
