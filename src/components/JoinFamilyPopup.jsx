import React, { useState } from "react";

const JoinFamilyPopup = ({ onClose, onSubmit, warning, setWarning,loading }) => {
  const [srno, setSrno] = useState("");
  const [mobile, setMobile] = useState("");

  const handleSrnoChange = (e) => {
    setSrno(e.target.value);
    // Clear the external warning state when the user edits
    setWarning(""); 
  };

  const handleMobileChange = (e) => {
    setMobile(e.target.value);
    // Clear the external warning state when the user edits
    setWarning(""); 
  };

  const handleSubmit = () => {
    if (!srno.trim() || !mobile.trim()) {
      alert("⚠️ કૃપા કરીને SRNO અને મોબાઈલ નંબર બંને દાખલ કરો.");
      return;
    }
    onSubmit(srno.trim(), mobile.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 sm:w-96 shadow-lg">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
          🤝 ફેમિલી જોઈન કરો
        </h2>
        
        {/* Display the warning message if one is present */}
        {warning && (
          <p className="text-center text-red-500 text-sm mb-3 font-medium">
            {warning}
          </p>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ફેમિલી SRNO
            </label>
            <input
              type="number"
              value={srno}
              onChange={handleSrnoChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              placeholder="દા.ત. 1001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              મોબાઇલ નંબર (country code વગર)
            </label>
            <input
              type="number"
              value={mobile}
              onChange={handleMobileChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              placeholder="દા.ત. 9876543210"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinFamilyPopup;