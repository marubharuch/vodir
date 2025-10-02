import React from "react";

const CityInputs = ({ formData, setFormData, joinPin, setJoinPin, profile }) => {
  return (
    <>
      <h2 className="text-lg font-bold">🏠 શહેરની માહિતી</h2>
      <input
        type="text"
        placeholder="વતન શહેર"
        value={formData.nativeCity}
        onChange={(e) =>
          setFormData({ ...formData, nativeCity: e.target.value })
        }
        className="border p-1 m-1"
      />
      <input
        type="text"
        placeholder="હાલનું શહેર"
        value={formData.currentCity}
        onChange={(e) =>
          setFormData({ ...formData, currentCity: e.target.value })
        }
        className="border p-1 m-1"
      />
      {!profile && (
        <div className="mb-2">
          <input
            type="text"
            placeholder="ફેમિલી PIN દાખલ કરો"
            value={joinPin}
            onChange={(e) => setJoinPin(e.target.value)}
            className="border p-1 w-48"
          />
        </div>
      )}
    </>
  );
};

export default CityInputs;