import React, { useState, useEffect, useRef } from 'react';

const NumbersGrid = ({ drawnNumbers, onDrawNumber, disabled }) => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Arrange numbers into columns: 1–10, 11–20, etc.
  const columns = Array.from({ length: 9 }, (_, col) =>
    Array.from({ length: 10 }, (_, row) => col * 10 + row + 1).filter((n) => n <= 90)
  );

  const handleButtonClick = (num) => {
    if (drawnNumbers.includes(num) || disabled) return;
    setSelectedNumber(num);
    setShowConfirm(true);
  };

  const confirmDraw = () => {
    if (selectedNumber !== null) {
      onDrawNumber(selectedNumber);
    }
    setShowConfirm(false);
    setSelectedNumber(null);
  };

  const cancelDraw = () => {
    setShowConfirm(false);
    setSelectedNumber(null);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-9 gap-1 p-2 bg-white rounded-xl shadow-md max-h-[60vh] overflow-y-auto">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-1">
            {col.map((num) => {
              const isDrawn = drawnNumbers.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => handleButtonClick(num)}
                  disabled={isDrawn || disabled}
                  className={`h-10 w-10 flex items-center justify-center text-sm rounded-md transition-colors ${
                    isDrawn
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Draw</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to draw number {selectedNumber}?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDraw}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDraw}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PrizeList = ({ prizes, onChange }) => (
  <div className="bg-gradient-to-r from-green-200 to-green-100 p-4 rounded-xl shadow-md space-y-4">
    <h2 className="text-xl font-bold text-gray-700 text-center">🏆 Prizes</h2>
    {prizes.map((prize, index) => (
      <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
        <input
          type="checkbox"
          checked={prize.checked}
          onChange={(e) => onChange(index, { ...prize, checked: e.target.checked })}
          className="h-4 w-4 text-green-500"
        />
        <input
          type="text"
          value={prize.name}
          onChange={(e) => onChange(index, { ...prize, name: e.target.value })}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="Prize Name"
        />
        <input
          type="number"
          value={prize.amount}
          onChange={(e) => onChange(index, { ...prize, amount: e.target.value })}
          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="Amount"
        />
        <input
          type="text"
          value={prize.details}
          onChange={(e) => onChange(index, { ...prize, details: e.target.value })}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="Details"
        />
      </div>
    ))}
  </div>
);

const HousieAdmin = () => {
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [autoDraw, setAutoDraw] = useState(false);
  const autoDrawRef = useRef(null);
  const [prizes, setPrizes] = useState([
    { name: 'Early Five', amount: '', details: '', checked: false },
    { name: 'Top Line', amount: '', details: '', checked: false },
    { name: 'Full House', amount: '', details: '', checked: false },
  ]);

  const handleDrawNumber = (num) => {
    setDrawnNumbers((prev) => [...prev, num]);
    triggerDisable();
  };

  const triggerDisable = () => {
    setDisabled(true);
    setTimeout(() => setDisabled(false), 10000);
  };

  const toggleAutoDraw = () => {
    setAutoDraw((prev) => !prev);
  };

  useEffect(() => {
    if (autoDraw) {
      autoDrawRef.current = setInterval(() => {
        const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
        const remaining = allNumbers.filter((n) => !drawnNumbers.includes(n));
        if (remaining.length === 0) {
          clearInterval(autoDrawRef.current);
          setAutoDraw(false);
          return;
        }
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        handleDrawNumber(next);
      }, 3000);
    } else {
      clearInterval(autoDrawRef.current);
    }
    return () => clearInterval(autoDrawRef.current);
  }, [autoDraw, drawnNumbers]);

  const handlePrizeChange = (index, updatedPrize) => {
    const newPrizes = [...prizes];
    newPrizes[index] = updatedPrize;
    setPrizes(newPrizes);
  };

  return (
    <div className="space-y-6 p-4 max-w-full min-h-screen bg-gray-50">
      <div className="flex items-center justify-between bg-yellow-100 p-4 rounded-xl shadow-md">
        <h1 className="text-xl font-bold text-gray-700">Housie Admin Panel</h1>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoDraw}
            onChange={toggleAutoDraw}
            id="autoDraw"
            className="h-4 w-4 text-yellow-500"
          />
          <label htmlFor="autoDraw" className="text-sm text-gray-700">
            Auto Draw
          </label>
        </div>
      </div>

      <NumbersGrid drawnNumbers={drawnNumbers} onDrawNumber={handleDrawNumber} disabled={disabled} />

      <PrizeList prizes={prizes} onChange={handlePrizeChange} />
    </div>
  );
};

export default HousieAdmin;
