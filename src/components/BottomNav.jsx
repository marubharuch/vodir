import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaPlusCircle, FaCommentDots } from 'react-icons/fa';

const BottomNav = () => {
  return (
     <div
  className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-3 z-50"
  role="navigation"
>
     
     
     
      <Link to="/" className="flex flex-col items-center text-gray-700 hover:text-gray-500">
        <FaHome size={28} />
        <span className="text-xs">Home</span>
      </Link>
      <Link to="/housie" className="flex flex-col items-center text-gray-700 hover:text-gray-500">
        <FaPlusCircle size={28} />
        <span className="text-xs">Housie</span>
      </Link>
      <Link to="/housieadmin" className="flex flex-col items-center text-gray-700 hover:text-gray-500">
        <FaCommentDots size={28} />
        <span className="text-xs">Admin</span>
      </Link>
      <Link to="/voice" className="flex flex-col items-center text-gray-700 hover:text-gray-500">
        <FaSearch size={28} />
        <span className="text-xs">Families</span>
      </Link>


    </div>
  );
};

export default BottomNav;
