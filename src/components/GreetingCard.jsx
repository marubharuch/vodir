import React, { useState } from 'react';

// Yeh component user ka swagat karta hai aur language ke aadhar par
// directory update karne ke liye zaroori message display karta hai.
const GreetingCard = ({ user }) => {
  // State to manage the selected language: 'Guj' (Gujarati) or 'Eng' (English)
  const [lang, setLang] = useState('Guj'); 

  const gujaratiMessage = (
    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
      સમાજની ડિરેક્ટરીને સાચી અને અપડેટેડ રાખવું દરેક સભ્યની જવાબદારી છે.
      આપના સહયોગ અને સક્રિય ભાગીદારી બદલ આભાર.
      <br />
      કૃપા કરીને આપના પરિવારનો ડેટા અપડેટ કરવા માટે જમણી બાજુના નીચેના ખૂણામાં **'ફેમિલી'** બટન પર ક્લિક કરો.
    </p>
  );

  const englishMessage = (
    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
      Keeping the community directory accurate and updated is a shared
      responsibility. Thank you for your support and active participation.
      <br />
      Please click on the **'Family'** button in the bottom right corner to update your family data.
    </p>
  );

  return (
    <div className="text-center px-4 py-3 sm:px-6 sm:py-4 bg-white rounded-lg shadow-xl border border-gray-200">
      
      {/* Language Selection Radio Buttons */}
      <div className="flex justify-center mb-4 space-x-6 p-2 bg-indigo-50 rounded-lg shadow-inner">
        <label className="flex items-center text-sm font-semibold text-indigo-800 cursor-pointer">
          <input
            type="radio"
            name="language"
            value="Guj"
            checked={lang === 'Guj'}
            onChange={() => setLang('Guj')}
            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 transition duration-150 ease-in-out"
          />
          <span className="ml-2">ગુજરાતી (Guj)</span>
        </label>
        <label className="flex items-center text-sm font-semibold text-indigo-800 cursor-pointer">
          <input
            type="radio"
            name="language"
            value="Eng"
            checked={lang === 'Eng'}
            onChange={() => setLang('Eng')}
            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 transition duration-150 ease-in-out"
          />
          <span className="ml-2">English (Eng)</span>
        </label>
      </div>

      <h5 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 border-b pb-2">
        Welcome, {user?.displayName || user?.email} 🎉
      </h5>

      {/* Conditional Message Rendering based on 'lang' state */}
      {lang === 'Guj' ? gujaratiMessage : englishMessage}
    </div>
  );
};

export default GreetingCard;
