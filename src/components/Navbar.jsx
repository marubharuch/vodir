// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Function to close the menu
  const handleCloseMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-blue-800 text-white p-1">
      <div className="container mx-auto flex items-center justify-between">
        
        {/* Hamburger Icon on Left */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Title always in single row */}
        <div className="flex-1 text-center md:text-left mx-4">
          <Link to="/" className="text-lg font-semibold truncate" onClick={handleCloseMenu}>
            શ્રી વિશા ઓશવાલ સેવા સમાજ
          </Link>
        </div>

        {/* Profile/Login Icon on Right */}
        <div>
  <button
    onClick={() => {
      handleCloseMenu(); // your existing function
      if (window.matchMedia('(display-mode: standalone)').matches) {
        window.close(); // for PWA
      } else {
        window.location.href = "about:blank"; // for normal browser
      }
    }}
    className="hover:text-red-500 transition"
  >
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
</div>

      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-700">
          <div className="flex flex-col space-y-2 p-4">
            <Link to="/" className="hover:text-gray-300" onClick={handleCloseMenu}>Home</Link>
            <Link to="/login" className="hover:text-gray-300" onClick={handleCloseMenu}>Login</Link>
            <Link to="/register" className="hover:text-gray-300" onClick={handleCloseMenu}>Register</Link>
            <Link to="/profile" className="hover:text-gray-300"onClick={handleCloseMenu} >Profile</Link>
            <Link to="/boards" className="hover:text-gray-300" onClick={handleCloseMenu}>Boards</Link>
            <Link to="/matrimonial" className="hover:text-gray-300" onClick={handleCloseMenu}>Matrimonial</Link>
            <Link to="/team" className="hover:text-gray-300" onClick={handleCloseMenu}>Developer Team</Link>
            <Link to="/blogs" className="hover:text-gray-300" onClick={handleCloseMenu}>Blogs</Link>
            <Link to="/comments" className="hover:text-gray-300" onClick={handleCloseMenu}>Comments</Link>
            <button className="text-left hover:text-gray-300" onClick={handleCloseMenu}>Logout</button>
          </div>
        </div>
      )}

      {/* Desktop Menu */}
      <div className="hidden md:flex justify-center space-x-4 mt-2">
        <Link to="/" className="hover:text-gray-300">Home</Link>
        <Link to="/login" className="hover:text-gray-300">Login</Link>
        <Link to="/register" className="hover:text-gray-300">Register</Link>
        <Link to="/profile" className="hover:text-gray-300">Profile</Link>
        <Link to="/boards" className="hover:text-gray-300">Boards</Link>
        <Link to="/matrimonial" className="hover:text-gray-300">Matrimonial</Link>
        <Link to="/team" className="hover:text-gray-300">Developer Team</Link>
        <Link to="/blogs" className="hover:text-gray-300">Blogs</Link>
        <Link to="/comments" className="hover:text-gray-300">Comments</Link>
        <button className="hover:text-gray-300">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
