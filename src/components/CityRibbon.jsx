




import React from 'react';

const cities = ['Borsad', 'Valvod', 'Vatadara', 'Padara','Kavitha',  'Napad', 'Vatra', 'Dedarda'];


const CityRibbon = () => {
  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="flex whitespace-nowrap" 
        style={{ animation: 'var(--animation-marquee)' }}
      >
        {cities.map((city, index) => (
          <span key={index} className="text-l mx-2 font-bold text-gray-800 dark:text-gray-200">
            {city}
          </span>
        ))}
        {/* Duplicate the entire list of cities */}
        {cities.map((city, index) => (
          <span key={`dup-${index}`} className="text-l mx-4 font-bold text-gray-800 dark:text-gray-200">
            {city}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CityRibbon;
