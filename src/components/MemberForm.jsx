// src/components/MemberForm.jsx
import React from "react";

const MemberForm = ({ formData, setFormData, handleMemberSave, handleCancelEdit, editingId }) => (
  <div className="mt-3 border p-3 rounded">
    <h2 className="text-lg font-bold">📝 સભ્યની વિગતો</h2>
    <div className="flex gap-2 my-2">
      <select
        value={formData.gender}
        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
        className="border p-1 w-1/5"
      >
        <option value="">M/F</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <input
        type="text"
        value={formData.countryCode}
        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
        className="border p-1 w-16"
      />
      <input
        type="text"
        placeholder="મોબાઇલ"
        value={formData.mobile}
        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
        className="border p-1 flex-1"
      />
    </div>
    <input
      type="text"
      placeholder="નામ"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      className="border p-1 w-full my-2"
    />
    <div className="flex gap-2">
      <button
        onClick={handleMemberSave}
        className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
      >
        {editingId ? "અપડેટ કરો" : "સેવ કરો"}
      </button>
      <button
        onClick={handleCancelEdit}
        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
      >
        રદ કરો
      </button>
    </div>
  </div>
);

export default MemberForm;
