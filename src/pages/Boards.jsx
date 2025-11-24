// src/pages/Boards.jsx
import { useEffect, useState } from "react";
import localforage from "localforage";
import { ref, get, query, orderByChild, startAt } from "firebase/database";
import { db } from "../firebase";

// react-icons
import { FiPhoneCall } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function Boards() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const LF_KEY = "families_data";
  const LF_LAST_TS = "families_lastUpdated";

  useEffect(() => {
    syncFamilies();
  }, []);

  async function syncFamilies() {
    setLoading(true);

    const localData = (await localforage.getItem(LF_KEY)) || [];
    const lastSavedTimestamp = (await localforage.getItem(LF_LAST_TS)) || 0;

    setFamilies(localData);

    const familiesRef = ref(db, "families");
    const q = query(
      familiesRef,
      orderByChild("updatedAt"),
      startAt(lastSavedTimestamp + 1)
    );

    const snap = await get(q);
    let updatedArray = [];

    if (snap.exists()) {
      const updates = snap.val();
      updatedArray = Object.keys(updates).map((id) => ({
        id,
        ...updates[id],
      }));
    }

    const merged = mergeUpdated(localData, updatedArray);

    await localforage.setItem(LF_KEY, merged);

    const newTimestamp = Math.max(
      lastSavedTimestamp,
      ...updatedArray.map((f) => f.updatedAt || 0)
    );

    await localforage.setItem(LF_LAST_TS, newTimestamp);

    setFamilies(merged);
    setLoading(false);
  }

  function mergeUpdated(oldList, updatedList) {
    const map = new Map();
    oldList.forEach((item) => map.set(item.id, item));
    updatedList.forEach((item) => map.set(item.id, item));
    return [...map.values()];
  }

  return (
    <div className="p-3 pb-20">
      <h1 className="text-xl font-bold mb-4 text-gray-800">
        Boards Page (Family Sync)
      </h1>

      {loading && <p className="text-blue-500 mb-3">Syncing...</p>}

      <div className="space-y-3">
        {families.map((f, index) => (
          <div
            key={f.id}
            className="p-3 rounded-xl shadow bg-white border border-gray-200"
          >
            {/* City Title */}
            <h2 className="font-semibold text-base mb-2">
              {index + 1}. {f.currentCity} ({f.nativeCity})
            </h2>

            {/* Members */}
            {Array.isArray(f.members) && f.members.length > 0 ? (
              <div className="space-y-2">
                {f.members.map((m, i) => {
                  const genderColor =
                    m.gender === "Male"
                      ? "text-blue-600"
                      : "text-pink-600";

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between"
                    >
                      {/* Call */}
                      <a
                        href={`tel:${m.mobile}`}
                        className="p-1 text-green-600"
                      >
                        <FiPhoneCall size={20} />
                      </a>

                      {/* Name */}
                      <span
                        className={`flex-1 px-3 text-sm font-medium ${genderColor}`}
                      >
                        {m.name}
                      </span>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/91${m.mobile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-green-600"
                      >
                        <FaWhatsapp size={22} />
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No members</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
