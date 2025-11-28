import React, { useEffect } from "react";

// Convert any string → Proper Case
const toProperCase = (str) => {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
};

// English letters + space only
const NAME_REGEX = /^[A-Za-z\s]+$/;

const MemberForm = ({ formData, setFormData, handleMemberSave, handleCancelEdit, editingId, selectedMember }) => {

  useEffect(() => {
    if (editingId && selectedMember) {
      setFormData({
        nativeCity: selectedMember.nativeCity || formData.nativeCity || "",
        currentCity: selectedMember.currentCity || formData.currentCity || "",
        gender: selectedMember.gender || "",
        name: selectedMember.name || "",
        countryCode: selectedMember.countryCode || "+91",
        mobile: selectedMember.mobile || "",
      });
    } else if (!editingId) {
      setFormData((s) => ({
        ...s,
        gender: "",
        name: "",
        countryCode: "+91",
        mobile: "",
      }));
    }
  }, [editingId, selectedMember, setFormData]);

  const [errors, setErrors] = React.useState({});

  // ⭐ VALIDATION
  const validate = () => {
    const newErrors = {};

    const rawName = formData.name?.trim();
    const name = rawName || "";

    // 1️⃣ Required
    if (!name) {
      newErrors.name = "નામ જરૂરી છે";
    }

    // 2️⃣ Only English and spaces
    if (name && !NAME_REGEX.test(name)) {
      newErrors.name = "ફક્ત ઇંગ્લિશ અક્ષર જ ચાલશે (A–Z)";
    }

    // 3️⃣ Minimum two words
    if (name.split(/\s+/).length < 2) {
      newErrors.name = "નામમાં ઓછામાં ઓછા બે શબ્દ હોવા જોઈએ (e.g., First Last)";
    }

    // 4️⃣ Apply proper-case
    if (!newErrors.name) {
      const proper = toProperCase(name);
      setFormData((prev) => ({ ...prev, name: proper }));
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = "જાતિ પસંદ કરો";
    }

    // Mobile
    const mobile = formData.mobile?.trim();
    if (!mobile || mobile.length !== 10 || !/^[0-9]{10}$/.test(mobile)) {
      newErrors.mobile = "માન્ય 10 અંકનો મોબાઇલ નંબર નાખો";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SAVE WRAPPER
  const handleValidatedSave = () => {
    if (!validate()) return;
    handleMemberSave();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="w-full h-[92vh] sm:h-auto sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 overflow-y-auto animate-slideUp">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            📝 {editingId ? "Edit Details" : "New Member Details"}
          </h2>
          <button onClick={handleCancelEdit} className="text-gray-500 text-xl hover:text-gray-700">
            ✖
          </button>
        </div>

        {/* FULL NAME */}
        <input
          id="name"
          type="text"
          placeholder="Name (English Only)"
          value={formData.name}
          onChange={(e) => {
            const val = e.target.value;

            // Allow typing but block Gujarati, digits, symbols
            if (val === "" || NAME_REGEX.test(val)) {
              setFormData({ ...formData, name: val });
            }
          }}
          className={`w-full p-3 mb-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 
            ${errors?.name ? "border-red-600 animate-shake" : "border-gray-300"}`}
        />
        {errors?.name && (
          <p className="text-red-600 text-sm mb-3">{errors.name}</p>
        )}

        {/* GENDER */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">જાતિ (Gender)</label>

          <div className={`flex rounded-lg border bg-gray-100 p-1
              ${errors?.gender ? "border-red-600 animate-shake" : "border-indigo-500"}
          `}>
            <button
              onClick={() => setFormData({ ...formData, gender: "Male" })}
              className={`flex-1 py-2 rounded-md 
                ${formData.gender === "Male" ? "bg-indigo-500 text-white" : "text-indigo-600 hover:bg-gray-200"}
              `}
            >
              Male
            </button>

            <button
              onClick={() => setFormData({ ...formData, gender: "Female" })}
              className={`flex-1 py-2 rounded-md 
                ${formData.gender === "Female" ? "bg-indigo-500 text-white" : "text-indigo-600 hover:bg-gray-200"}
              `}
            >
              Female
            </button>
          </div>

          {errors?.gender && (
            <p className="text-red-600 text-sm mb-3">{errors.gender}</p>
          )}
        </div>

        {/* MOBILE */}
        <div className="grid grid-cols-4 gap-2 mb-1">
          <input
            type="text"
            value={formData.countryCode}
            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
            className="col-span-1 p-3 border border-gray-300 rounded-lg text-center"
          />

          <input
            id="mobile"
            type="tel"
            placeholder="મોબાઇલ નંબર"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({ ...formData, mobile: e.target.value.trim() })
            }
            className={`col-span-3 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500  
              ${errors?.mobile ? "border-red-600 animate-shake" : "border-gray-300"}`}
          />
        </div>

        {errors?.mobile && (
          <p className="text-red-600 text-sm mb-4">{errors.mobile}</p>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3 sticky bottom-0 bg-white pt-3 pb-2">
          <button
            onClick={handleCancelEdit}
            className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-lg shadow hover:bg-red-600"
          >
            રદ કરો
          </button>

          <button
            onClick={handleValidatedSave}
            className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-green-700"
          >
            {editingId ? "અપડેટ કરો" : "સેવ કરો"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberForm;
