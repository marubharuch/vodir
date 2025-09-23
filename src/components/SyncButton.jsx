import React, { useState } from "react";
import { dataStore } from "../localDb";

const SyncButton = () => {
  const [status, setStatus] = useState("");

  const handleSync = async () => {
    try {
      setStatus("🔄 Syncing...");

      // Example: Local data export
      const allKeys = await dataStore.keys();
      const localData = {};
      for (const key of allKeys) {
        localData[key] = await dataStore.getItem(key);
      }

      console.log("Local Data:", localData);

      // 👉 અહીં તમે Firebase / AWS API સાથે integrate કરી શકો છો
      // await syncWithFirestore(localData);
      // await syncWithAws(localData);

      setStatus("✅ Sync successful!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Sync failed");
    }
  };

  return (
    <div>
      <button
        onClick={handleSync}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Sync Data
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
};

export default SyncButton;
