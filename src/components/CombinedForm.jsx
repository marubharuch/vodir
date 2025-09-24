// src/components/CombinedForm.jsx
import React, { useState, useEffect } from "react";
import { useProfile } from "../context/ProfileContext";
import { datastore } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const CombinedForm = () => {
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    nativeCity: "",
    currentCity: "",
    gender: "",
    name: "",
    countryCode: "+91",
    mobile: ""
  });
  const [joinPin, setJoinPin] = useState("");
  const [cityLocked, setCityLocked] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [warning, setWarning] = useState("");
  const [finalized, setFinalized] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // 👉 Load profile if available
  useEffect(() => {
    if (profile) {
      setFormData((s) => ({
        ...s,
        nativeCity: profile.nativeCity || "",
        currentCity: profile.currentCity || ""
      }));
      setMembers(profile.members || []);
      if (profile.nativeCity && profile.currentCity) setCityLocked(true);
      if (profile.members?.length > 0) {
        setFinalized(true);
        setShowForm(false);
      }
      if (profile.pin) setJoinPin(profile.pin);
    }
  }, [profile]);

  const canAdd =
    formData.gender &&
    formData.name.trim() &&
    formData.countryCode.startsWith("+") &&
    formData.mobile.trim();

  // 👉 Add or Update Member
  const handleAdd = () => {
    if (!formData.nativeCity.trim() || !formData.currentCity.trim()) {
      setWarning("⚠️ Please fill Native & Current City first.");
      return;
    }
    if (!canAdd) {
      setWarning("⚠️ Complete Gender, Name, Country Code, Mobile.");
      return;
    }
    setWarning("");

    if (editingId) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                gender: formData.gender,
                name: formData.name.trim(),
                countryCode: formData.countryCode,
                mobile: formData.mobile
              }
            : m
        )
      );
      setEditingId(null);
    } else {
      setMembers((prev) => [
        ...prev,
        {
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
          userId: user.uid,
          gender: formData.gender,
          name: formData.name.trim(),
          countryCode: formData.countryCode,
          mobile: formData.mobile
        }
      ]);
    }

    setCityLocked(true);
    setFormData((s) => ({
      ...s,
      gender: "",
      name: "",
      countryCode: "+91",
      mobile: ""
    }));
  };

  // 👉 Finish form → save to Firestore + localForage
  const handleFinish = async () => {
    if (!formData.nativeCity.trim() || !formData.currentCity.trim()) {
      setWarning("⚠️ Please fill all data (Native, Current City).");
      return;
    }

    const hasPendingMember =
      formData.gender &&
      formData.name.trim() &&
      formData.countryCode.startsWith("+") &&
      formData.mobile.trim();

    const updatedMembers = hasPendingMember
      ? [
          ...members,
          {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
            userId: user.uid,
            gender: formData.gender,
            name: formData.name.trim(),
            countryCode: formData.countryCode,
            mobile: formData.mobile
          }
        ]
      : members;

    let familyDocRef;

    if (joinPin.trim()) {
      // ✅ Join existing family via PIN
      const familiesRef = collection(datastore, "families");
      const q = query(familiesRef, where("pin", "==", joinPin));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        familyDocRef = doc(datastore, "families", docSnap.id);

        const existingData = docSnap.data();
        const newMembers = [
          ...existingData.members,
          ...updatedMembers.filter(
            (m) => !existingData.members.some((em) => em.userId === m.userId)
          )
        ];

        await updateDoc(familyDocRef, { members: newMembers });
        updateProfile({ ...existingData, members: newMembers, id: docSnap.id, pin: joinPin });
        alert("✅ Joined existing family successfully!");
      } else {
        setWarning("⚠️ Invalid PIN. Cannot join family.");
        return;
      }
    } else {
      // ✅ Create new family
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      const familyPayload = {
        pin,
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        createdBy: user.uid,
        members: updatedMembers
      };

      familyDocRef = doc(collection(datastore, "families")); // auto-ID
      await setDoc(familyDocRef, familyPayload);
      updateProfile({ ...familyPayload, id: familyDocRef.id });
      setJoinPin(pin);
      alert(`✅ Family created! Your family PIN is ${pin}`);
    }

    setMembers(updatedMembers);
    setCityLocked(true);
    setFinalized(true);
    setShowForm(false);
    setEditingId(null);
    setWarning("");
  };

  const startEditMember = (id) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id);
    setFormData({
      ...formData,
      gender: m.gender,
      name: m.name,
      countryCode: m.countryCode,
      mobile: m.mobile
    });
    setShowForm(true);
  };

  const deleteMember = (id) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    updateProfile({ ...profile, members: updated });
  };

  return (
    <div className="p-3">
      <h2 className="text-lg font-bold">🏠 City Information</h2>
      <input
        type="text"
        placeholder="Native City"
        value={formData.nativeCity}
        disabled={cityLocked}
        onChange={(e) => setFormData({ ...formData, nativeCity: e.target.value })}
        className="border p-1 m-1"
      />
      <input
        type="text"
        placeholder="Current City"
        value={formData.currentCity}
        disabled={cityLocked}
        onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
        className="border p-1 m-1"
      />

      {/* Join Existing Family */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Enter Family PIN to join (optional)"
          value={joinPin}
          onChange={(e) => setJoinPin(e.target.value)}
          className="border p-1 w-48"
        />
      </div>

      <h2 className="text-lg font-bold mt-3">👥 Added Members</h2>
      {members.map((m) => (
        <div key={m.id} className="flex justify-between items-center border p-2 m-1 rounded">
          <span>
            {m.gender}: {m.name} ({m.countryCode} {m.mobile})
          </span>
          <div className="flex gap-2">
            <button onClick={() => startEditMember(m.id)} className="bg-yellow-400 px-2 py-1 rounded">
              ✏️
            </button>
            <button onClick={() => deleteMember(m.id)} className="bg-red-500 text-white px-2 py-1 rounded">
              🗑️
            </button>
          </div>
        </div>
      ))}

      {/* Member Form */}
      {showForm && (
        <div className="mt-3 border p-3 rounded">
          <h2 className="text-lg font-bold">📝 Member Form</h2>
          <div className="flex gap-2 my-2 w-full max-w-full">
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
              className="border p-1 w-16 flex-shrink-0"
            />

            <input
              type="text"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="border p-1 flex-1 min-w-0"
            />
          </div>

          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-1 w-full my-2"
          />

          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-green-500 text-white px-3 py-2 rounded">
              {editingId ? "Update" : "Add"}
            </button>

            {!editingId && (
              <button onClick={handleFinish} className="bg-blue-500 text-white px-3 py-2 rounded">
                Finish
              </button>
            )}
          </div>
        </div>
      )}

      {finalized && !showForm && (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mt-3"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData((s) => ({
              ...s,
              gender: "",
              name: "",
              countryCode: "+91",
              mobile: ""
            }));
          }}
        >
          ➕ Add New Member
        </button>
      )}

      {warning && <p className="text-red-500 mt-2">{warning}</p>}
    </div>
  );
};

export default CombinedForm;
