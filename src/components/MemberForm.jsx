// src/components/MemberForm.jsx
import React from "react";

const MemberForm = ({ formData, setFormData, handleMemberSave, handleCancelEdit, editingId }) => (
  // Main container with shadow and distinct background
  <div className="mt-4 p-5 bg-white border border-gray-200 rounded-xl shadow-lg">
    <h2 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center">
      <span className="mr-2 text-indigo-600">📝</span> સભ્યની વિગતો
    </h2>

    {/* Full Name Input */}
    <input
      type="text"
      placeholder="નામ (e.g., Sanjay Gunvantbhai Shah)"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
      aria-label="Full Name"
    />

    {/* Gender Select */}
    <select
      value={formData.gender}
      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
      className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label="Gender"
    >
      <option value="" disabled>જાતિ (M/F)</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>
    
    {/* --- Mobile Number Group: The FIX is here --- */}
    {/* By removing the horizontal flex and using a grid/gap on mobile, 
        we ensure the elements never try to occupy the same narrow line. */}
    <div className="grid grid-cols-4 gap-2 mb-5"> 
      {/* Country Code Input (1/4 width) */}
      <input
        type="text"
        value={formData.countryCode}
        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
        placeholder="+91"
        // w-1/4 is now handled by grid-cols-4
        className="col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 text-center"
        aria-label="Country Code"
      />
      {/* Mobile Number Input (3/4 width) */}
      <input
        type="tel" // Use type="tel" for better mobile keyboard
        placeholder="મોબાઇલ નંબર"
        value={formData.mobile}
        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
        // flex-1 is now handled by col-span-3
        className="col-span-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
        aria-label="Mobile Number"
      />
    </div>


    {/* --- Button Section --- */}
    {/* Changed to flex and space-x for correct side-by-side display */}
    <div className="flex gap-3 pt-2">
      <button
        onClick={handleCancelEdit}
        // Use flex-1 to make both buttons take up equal space
        className="flex-1 bg-red-500 text-white font-semibold px-4 py-3 rounded-lg shadow-md hover:bg-red-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        રદ કરો
      </button>
      <button
        onClick={handleMemberSave}
        // Use flex-1 to make both buttons take up equal space
        className="flex-1 bg-green-500 text-white font-semibold px-4 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        {editingId ? "અપડેટ કરો" : "સેવ કરો"}
      </button>
    </div>
  </div>
);

export default MemberForm;