import React, { useState } from 'react';

// REGEX → Only English A–Z (uppercase handled automatically)
const CITY_REGEX = /^[A-Z\s]+$/;

const CityInputs = ({ 
    formData, 
    setFormData, 
    isEditing, 
    isEditingCity, 
    setIsEditingCity,
    handleCitySave,
    startCityEdit
}) => {

    const [errors, setErrors] = useState({
        nativeCity: "",
        currentCity: ""
    });

    // Validate & Format Input
    const validateCity = (field, value) => {
        const upper = value.toUpperCase();

        // Allow empty (temporary)
        if (upper.trim() === "") {
            setErrors((prev) => ({ ...prev, [field]: "Required field" }));
            return upper;
        }

        // Check ENGLISH letters only (and spaces)
        if (!CITY_REGEX.test(upper)) {
            setErrors((prev) => ({
                ...prev,
                [field]: "Only English letters allowed (A–Z)"
            }));
        } else {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }

        return upper;
    };

    // VIEW MODE
    if (!isEditingCity) {
        return (
            <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h2 className="text-xl font-bold text-indigo-700">📍 Native & Current Place </h2>

                    {isEditing && (
                        <button 
                            onClick={startCityEdit}
                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                        >
                            ✏️ Edit
                        </button>
                    )}
                </div>

                <p className="text-gray-700">
                    <strong>વતન (Native City):</strong> {(formData.nativeCity || "").trim() || "N/A"}
                </p>
                <p className="text-gray-700">
                    <strong>હાલનું શહેર (Current City):</strong> {(formData.currentCity || "").trim() || "N/A"}
                </p>
            </div>
        );
    }

    // EDIT MODE
    return (
        <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-3 text-indigo-700">📍 ફેમિલી સ્થાન (Edit Mode)</h2>

            {/* --- Native City --- */}
            <div className="mb-3">
                <label htmlFor="nativeCity" className="block text-sm font-medium text-gray-700">
                    વતન (Native City)
                </label>

                <input
                    type="text"
                    id="nativeCity"
                    placeholder="BHAVNAGAR"
                    value={formData.nativeCity || ""}
                    onChange={(e) => {
                        const cleaned = validateCity("nativeCity", e.target.value);
                        setFormData({ ...formData, nativeCity: cleaned });
                    }}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500
                        ${errors.nativeCity ? "border-red-500" : "border-gray-300"}
                    `}
                />

                {errors.nativeCity && (
                    <p className="text-red-500 text-xs mt-1">{errors.nativeCity}</p>
                )}
            </div>

            {/* --- Current City --- */}
            <div className="mb-4">
                <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700">
                    હાલનું શહેર (Current City)
                </label>

                <input
                    type="text"
                    id="currentCity"
                    placeholder="SURAT"
                    value={formData.currentCity || ""}
                    onChange={(e) => {
                        const cleaned = validateCity("currentCity", e.target.value);
                        setFormData({ ...formData, currentCity: cleaned });
                    }}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500
                        ${errors.currentCity ? "border-red-500" : "border-gray-300"}
                    `}
                />

                {errors.currentCity && (
                    <p className="text-red-500 text-xs mt-1">{errors.currentCity}</p>
                )}
            </div>

            {/* Disable Save if any validation error */}
            <button
                onClick={errors.nativeCity || errors.currentCity ? null : handleCitySave}
                disabled={errors.nativeCity || errors.currentCity}
                className={`mt-4 w-full py-2 rounded-lg font-semibold shadow 
                    ${errors.nativeCity || errors.currentCity
                        ? "bg-gray-400 text-gray-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
            >
                Save City Data
            </button>
        </div>
    );
};

export default CityInputs;
