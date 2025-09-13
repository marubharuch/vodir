// HousieUser.jsx
import React, { useState } from 'react';

const DrawnNumberDisplay = ({ number }) => (
  <div className="bg-gradient-to-r from-yellow-300 to-yellow-200 text-3xl font-bold p-6 rounded-xl shadow-md text-center transition-all duration-300">
    🎯 <span>{number !== null ? `Current Number: ${number}` : 'Waiting for draw...'}</span>
  </div>
);

const HousieTicket = ({ ticket, drawnNumbers }) => (
  <div className="overflow-x-auto bg-white p-2 rounded-xl shadow-md">
    <h2 className="text-lg font-semibold mb-1 text-gray-700 text-center">Your Ticket</h2>
    <div className="inline-block min-w-full border border-gray-300 rounded-lg">
      {ticket.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-9 border-b last:border-0 border-gray-300">
          {row.map((num, colIndex) => {
            const isDrawn = num && drawnNumbers.includes(num);
            return (
              <div
                key={colIndex}
                className={`border-r last:border-0 border-gray-300 h-8 flex items-center justify-center text-sm sm:text-base ${
                  num
                    ? isDrawn
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {num || ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </div>
);


const PrizeDisplay = ({ prizes, onClaim }) => (
  <div className="bg-gradient-to-r from-green-200 to-green-100 p-4 rounded-xl shadow-md">
    <h2 className="text-xl font-bold mb-3 text-gray-700 text-center">🏆 Prizes</h2>
    <ul className="space-y-3">
      {prizes.map((prize, index) => (
        <li
          key={index}
          className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="font-medium text-gray-800">{prize.name}</span>
          <button
            onClick={() => onClaim(index)}
            disabled={prize.claimed}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
              prize.claimed
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {prize.claimed ? 'Claimed' : 'Claim'}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

const HousieUser = () => {
  const [drawnNumber, setDrawnNumber] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [prizes, setPrizes] = useState([
    { name: 'Early Five', claimed: false },
    { name: 'Top Line', claimed: false },
    { name: 'Full House', claimed: false },
  ]);

  const sampleTicket = [
    [null, 12, null, 34, null, 56, null, 78, null],
    [1, null, 23, null, 45, null, 67, null, 89],
    [null, 14, null, 36, null, 58, null, 80, null],
  ];

  const handleDrawNumber = () => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const remaining = allNumbers.filter(n => !drawnNumbers.includes(n));
    if (remaining.length === 0) return;
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setDrawnNumber(next);
    setDrawnNumbers([...drawnNumbers, next]);
  };

  const handleClaimPrize = (index) => {
    setPrizes(prizes.map((prize, i) =>
      i === index ? { ...prize, claimed: true } : prize
    ));
  };

  return (
    <div className="space-y-8 p-2 max-w-4xl mx-auto">
      <DrawnNumberDisplay number={drawnNumber} />
    {/*  <div className="flex justify-center">
        <button
          onClick={handleDrawNumber}
          className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md transition-colors font-semibold"
        >
          🎲 Draw Next Number
        </button>
  </div>*/}
      <HousieTicket ticket={sampleTicket} drawnNumbers={drawnNumbers} />
      <PrizeDisplay prizes={prizes} onClaim={handleClaimPrize} />
    </div>
  );
};

export default HousieUser;
