import React from 'react';

const CityInputs = ({ formData, setFormData, joinSrno, setJoinSrno, profile }) => {
    console.log("cityinput")
    // Determine if the Join SRNO input should be disabled
    // It is disabled if a family profile already exists (profile?.id is true)
    const isJoinInputDisabled = !!profile?.id;

    // Determine if the City inputs should be disabled
    // They are disabled if the user is in "Join" mode (joinSrno is entered and profile is null)
    const isCityInputDisabled = joinSrno.trim().length > 0 && !profile?.id;

    return (
        <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-3 text-indigo-700">📍 ફેમિલી સ્થાન</h2>
            
            {/* --- 1. Native City --- */}
            <div className="mb-3">
                <label htmlFor="nativeCity" className="block text-sm font-medium text-gray-700">
                    વતન (Native City)
                </label>
                <input
                    type="text"
                    id="nativeCity"
                    placeholder="દા.ત. ભાવનગર"
                    value={formData.nativeCity}
                    onChange={(e) =>
                        setFormData({ ...formData, nativeCity: e.target.value })
                    }
                    disabled={isCityInputDisabled}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm 
                        ${isCityInputDisabled ? 'bg-gray-100 text-gray-500' : 'focus:ring-indigo-500 focus:border-indigo-500 border-gray-300'}
                    `}
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
                    value={formData.currentCity}
                    onChange={(e) =>
                        setFormData({ ...formData, currentCity: e.target.value })
                    }
                    disabled={isCityInputDisabled}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm 
                        ${isCityInputDisabled ? 'bg-gray-100 text-gray-500' : 'focus:ring-indigo-500 focus:border-indigo-500 border-gray-300'}
                    `}
                />
            </div>

            {/* --- Separator and Join SRNO --- */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-semibold">
                        OR
                    </span>
                </div>
            </div>

            {/* --- 3. Join SRNO --- */}
           {/* <div className="mb-2">
                <label htmlFor="joinSrno" className="block text-sm font-medium text-gray-700">
                    ફેમિલી SRNO દાખલ કરો (જોડાવવા માટે)
                </label>
                <input
                    type="text"
                    id="joinSrno"
                    placeholder="Family SRNO"
                    value={joinSrno}
                    onChange={(e) => {
                         // Clear city fields when entering join SRNO to force user to use the member form for their details
                        setJoinSrno(e.target.value);
                        if(e.target.value.trim().length > 0 && !profile?.id) {
                            setFormData(s => ({ ...s, nativeCity: '', currentCity: '' }));
                        }
                    }}
                    disabled={isJoinInputDisabled}
                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm font-mono 
                        ${isJoinInputDisabled ? 'bg-gray-100 text-gray-500' : 'border-blue-500 focus:ring-blue-500 focus:border-blue-500'}
                    `}
                />
            </div>*/}
            {isJoinInputDisabled && (
                <p className="text-xs text-indigo-500 mt-1">
                    તમે પહેલેથી જ Family ID: **{profile.id}** માં જોડાયેલા છો.
                </p>
            )}
            {!isJoinInputDisabled && joinSrno.trim().length > 0 && (
                 <p className="text-sm text-blue-600 mt-2 p-1 bg-blue-50 rounded">
                    ✅ Family ID દાખલ થયેલ છે. હવે તમારું નામ અને મોબાઇલ નંબર નીચેના ફોર્મમાં ભરો.
                </p>
            )}
        </div>
    );
};

export default CityInputs;