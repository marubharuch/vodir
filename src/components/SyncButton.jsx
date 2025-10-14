import React, { useState } from "react";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import { loadFamilyProfile } from "../utils/loadFamilyProfile";
import safeLocalForage from "../utils/safeLocalForage";

const SyncButton = () => {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);

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
