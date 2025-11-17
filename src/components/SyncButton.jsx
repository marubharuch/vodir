// src/components/SyncButton.jsx

import React, { useState } from "react";
import { useProfile } from "../context/ProfileContext"; // useProfile માંથી profile ડેટા લેવાશે
import { useAuth } from "../context/AuthContext";
import { loadFamilyProfile } from "../utils/loadFamilyProfile";
import safeLocalForage from "../utils/safeLocalForage";

const SyncButton = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile(); // ⬅️ profile માંથી સ્થિતિ મેળવો
  const [loading, setLoading] = useState(false);

  // 💡 લોજિક: નક્કી કરો કે યુઝર Pending છે કે નહીં
  const isUserPending = profile?.isPendingUser; // (અહીં isPendingUser એ profile માંથી આવતું સ્ટેટસ હોવું જોઈએ)

  // જો તમારો Pending લોજિક isUserPending ને બહાર ગણે છે, તો તેને અહીં ફરી ગણવું પડશે:
  // const isUserPending = !!(profile?.pendingEditorEmails?.length && profile.pendingEditorEmails.includes(user?.email));
  // ☝️ નોંધ: જો તમે આ લોજિકને CombinedForm/useCombinedFormLogic માં ગણો છો, તો તેને અહીં ફરી લાવવું પડશે.

  if (!isUserPending) {
    return null; // ⬅️ જો પેન્ડિંગ ન હોય તો કંઈ ન બતાવો
  }

  const handleSync = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Remove old cache
      await safeLocalForage.removeItem("profileData"); 
      
      // Reload fresh from Firebase
      await loadFamilyProfile(user, updateProfile);
      alert("✅ Data synced successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Sync failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className={`px-4 py-2 rounded text-white ${
        loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {loading ? "Syncing..." : "Sync Data"}
    </button>
  );
};

export default SyncButton;