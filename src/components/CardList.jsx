// src/components/CardList/CardList.jsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';

const CardList = ({ cards }) => {
  return (
    <div className="mt-6 px-4 space-y-4 flex-1">
      {cards.map(card => (
        <div key={card.id} className="bg-white p-4 rounded-lg flex justify-between items-center shadow">
          <span className="font-semibold text-lg">{card.text}</span>
          <FaSearch className="text-gray-500" />
        </div>
      ))}
    </div>
  );
};

export default CardList;
