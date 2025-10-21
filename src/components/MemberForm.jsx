import React, { useEffect } from "react"; 

// 🚀 CRITICAL FIX: handleCloseForm aur onClose props ko nikal diya, sirf zaroori props rakhe.
const MemberForm = ({ formData, setFormData, handleMemberSave, handleCancelEdit, editingId, selectedMember }) => {

  // CRITICAL FIX: editingId ya selectedMember change hone par data load karo
  useEffect(() => {
    // Agar hum member ko edit kar rahe hain
    if (editingId && selectedMember) {
      // Existing member ka data form mein load karo
      setFormData({
        // City data ko bhi load karo (if needed for display/consistency)
        nativeCity: selectedMember.nativeCity || formData.nativeCity || "",
        currentCity: selectedMember.currentCity || formData.currentCity || "",
        gender: selectedMember.gender || "",
        name: selectedMember.name || "",
        countryCode: selectedMember.countryCode || "+91",
        mobile: selectedMember.mobile || "",
      });
    } else if (!editingId) {
      // Agar naya member add kar rahe hain (editingId null hai)
      // Toh sirf member-specific fields ko clear karo (city data ko rehne do)
      setFormData(s => ({ 
        ...s, 
        gender: "", 
        name: "", 
        countryCode: "+91", 
        mobile: "" 
      }));
    }
    // Dependencies ensure yeh hook tabhi chalta hai jab editing state badalti hai
  }, [editingId, selectedMember, setFormData]); 

  console.log("Member form rendered");
  
  // Member Form UI...
  return (
    <div className="mt-4 p-5 bg-white border border-gray-200 rounded-xl shadow-lg">
      <h2 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center">
        <span className="mr-2 text-indigo-600">📝</span> સભ્યની વિગતો
      </h2>

      {/* Full Name Input */}
      <input
        type="text"
        placeholder="નામ (e.g., Sanjay Gunvantbhai Shah)"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
        aria-label="Full Name"
      />

      {/* Gender Select - Segmented Toggle */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          જાતિ (Gender)
        </label>
        <div className="flex rounded-lg border border-indigo-500 p-1 bg-gray-100">
          {/* ... (Gender Buttons) ... */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: 'Male' })}
            className={`flex-1 py-2 text-sm font-medium transition-colors duration-200 ${
              formData.gender === 'Male'
                ? 'bg-indigo-500 text-white shadow-md rounded-md' 
                : 'text-indigo-600 hover:bg-gray-200 rounded-md' 
            }`}
          >
            Male
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: 'Female' })}
            className={`flex-1 py-2 text-sm font-medium transition-colors duration-200 ${
              formData.gender === 'Female'
                ? 'bg-indigo-500 text-white shadow-md rounded-md' 
                : 'text-indigo-600 hover:bg-gray-200 rounded-md' 
            }`}
          >
            Female
          </button>
        </div>
      </div>
      
      {/* --- Mobile Number Group --- */}
      <div className="grid grid-cols-4 gap-2 mb-5"> 
        {/* Country Code Input */}
        <input
          type="text"
          value={formData.countryCode}
          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
          placeholder="+91"
          className="col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 text-center"
          aria-label="Country Code"
        />
        {/* Mobile Number Input */}
        <input
          type="tel" 
          placeholder="મોબાઇલ નંબર"
          value={formData.mobile}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          className="col-span-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
          aria-label="Mobile Number"
        />
      </div>


      {/* --- Button Section --- */}
      <div className="flex gap-3 pt-2">
        {/* Cancel button: Ye button handleCancelEdit ko call karega (jo ki handleCancelMemberForm hai) */}
        <button
            onClick={handleCancelEdit} 
            className="flex-1 bg-red-500 text-white font-semibold px-4 py-3 rounded-lg shadow-md hover:bg-red-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
            રદ કરો
        </button>
        
        {/* Save/Update Button */}
        <button
          onClick={handleMemberSave}
          className={`flex-1 bg-green-500 text-white font-semibold px-4 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
        >
          {editingId ? "અપડેટ કરો" : "સેવ કરો"}
        </button>
      </div>
    </div>
  );
};

export default MemberForm;