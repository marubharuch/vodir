import React from 'react';

// ✅ NEW PROPS: isEditingCity, setIsEditingCity, handleCitySave, startCityEdit
const CityInputs = ({ 
    formData, 
    setFormData, 
    isEditing, // Master editing flag
    isEditingCity, 
    setIsEditingCity,
    handleCitySave,
    startCityEdit
}) => {
    
    // Determine if we show input fields or labels
    const showInputMode = isEditingCity;

    // --- VIEW / LABEL MODE ---
    if (!showInputMode) {
        return (
            <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h2 className="text-xl font-bold text-indigo-700">📍Native & Current Place </h2>
                    {/* Only show Edit button if master editing is ON */}
                    {isEditing && (
                         <button 
                            onClick={startCityEdit} // This will set isEditingCity(true)
                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                        >
                            ✏️ Edit
                        </button>
                    )}
                </div>
                
                {/* Displaying Data as Labels */}
                <p className="text-gray-700">
                    <strong>વતન (Native City):</strong> {(formData.nativeCity || "").trim() || "N/A"}
                </p>
                <p className="text-gray-700">
                    <strong>હાલનું શહેર (Current City):</strong> {(formData.currentCity || "").trim() || "N/A"}
                </p>
            </div>
        );
    }
    
    // --- EDIT / INPUT MODE ---

    return (
        <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-3 text-indigo-700">📍 ફેમિલી સ્થાન (Edit Mode)</h2>
            
            {/* --- 1. Native City --- */}
            <div className="mb-3">
                <label htmlFor="nativeCity" className="block text-sm font-medium text-gray-700">
                    વતન (Native City)
                </label>
                <input
                    type="text"
                    id="nativeCity"
                    placeholder="દા.ત. ભાવનગર"
                    value={(formData.nativeCity || "").trim()}
                    onChange={(e) =>
                        setFormData({ ...formData, nativeCity: e.target.value })
                    }
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300`}
                />
            </div>

            {/* --- 2. Current City --- */}
            <div className="mb-4">
                <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700">
                    હાલનું શહેર (Current City)
                </label>
                <input
                    type="text"
                    id="currentCity"
                    placeholder="દા.ત. સુરત"
                    value={(formData.currentCity || "").trim()}
                    onChange={(e) =>
                        setFormData({ ...formData, currentCity: e.target.value })
                    }
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300`}
                />
            </div>
            
            {/* --- Save Button --- */}
            <button
                onClick={handleCitySave} // This calls handleCitySave and switches to Label View
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-indigo-700"
            >
                Save City Data
            </button>
        </div>
    );
};

export default CityInputs;