// src/pages/HomePage.jsx
import React from 'react';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Welcome to My Website</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Home Page</h2>
        <p className="mb-4">
          This is the home page of the website built using ReactJS and styled with Tailwind CSS.
          You can add more components and content here.
        </p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Get Started
        </button>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-center p-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} My Website. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
