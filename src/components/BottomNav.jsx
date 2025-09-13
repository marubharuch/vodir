// src/components/BottomNav/BottomNav.jsx
import React from 'react';
import { FaHome, FaSearch, FaPlusCircle, FaCommentDots } from 'react-icons/fa';

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
      <button><FaHome size={24} /></button>
      <button><FaSearch size={24} /></button>
      <button><FaPlusCircle size={24} /></button>
      <button><FaCommentDots size={24} /></button>
    </div>
  );
};

export default BottomNav;
