// src/pages/Boards.jsx
import { useEffect, useState, useRef } from "react";
import localforage from "localforage";
import { ref, get, query, orderByChild, startAt } from "firebase/database";
import { db } from "../firebase";

// Icons
import { FiPhoneCall } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function Boards() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterNative, setFilterNative] = useState("");
  const [showCityList, setShowCityList] = useState(false);
  const [showNativeList, setShowNativeList] = useState(false);

  const [expanded, setExpanded] = useState({});
  const letterRefs = useRef({});

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

  // Highlight matched search text
  function highlight(text, search) {
    if (!search) return text;
    const reg = new RegExp(`(${search})`, "gi");
    return text.replace(reg, "<mark>$1</mark>");
  }

  // -----------------------
  // FILTERED LIST
  // -----------------------
  const filtered = families.filter((f) => {
    if (filterCity && f.currentCity !== filterCity) return false;
    if (filterNative && f.nativeCity !== filterNative) return false;

    if (search) {
      return f.members?.some((m) =>
        m.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  // Sort families by first member name
  const sorted = [...filtered].sort((a, b) => {
    const aName = a.members?.[0]?.name?.toLowerCase() || "";
    const bName = b.members?.[0]?.name?.toLowerCase() || "";
    return aName.localeCompare(bName);
  });

  // -----------------------
  // GROUPING FOR A–Z
  // -----------------------
  const alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];

  const grouped = {};
  sorted.forEach((f) => {
    const ch = f.members?.[0]?.name?.[0]?.toUpperCase() || "#";
    const key = /^[A-Z]$/.test(ch) ? ch : "#";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  });

  const scrollToLetter = (letter) => {
    const el = letterRefs.current[letter];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ALL POSSIBLE CITIES
  const allCurrentCities = [...new Set(families.map((f) => f.currentCity))];
  const allNativeCities = [...new Set(families.map((f) => f.nativeCity))];

  return (
    <div className="p-3 pb-20">
      <h1 className="text-xl font-bold mb-4">Boards Page</h1>

      {/* TOP INPUTS */}
      <div className="flex gap-2 mb-4 items-center">
        {/* SEARCH 30% */}
        <input
          type="text"
          placeholder="Search member..."
          className="w-[30%] p-2 border rounded-lg text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CITY SELECT */}
        <button
          onClick={() => setShowCityList(!showCityList)}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          {filterCity || "Current City"}
        </button>

        {/* NATIVE CITY SELECT */}
        <button
          onClick={() => setShowNativeList(!showNativeList)}
          className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
        >
          {filterNative || "Native City"}
        </button>

        {/* CLEAR FILTERS */}
        <button
          onClick={() => {
            setSearch("");
            setFilterCity("");
            setFilterNative("");
          }}
          className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm"
        >
          Clear
        </button>
      </div>

      {/* CITY DROPDOWNS */}
      {showCityList && (
        <div className="p-3 border bg-white rounded-lg shadow mb-3">
          {allCurrentCities.map((city) => (
            <div
              key={city}
              onClick={() => {
                setFilterCity(city);
                setShowCityList(false);
              }}
              className="py-1 cursor-pointer hover:bg-gray-100"
            >
              {city}
            </div>
          ))}
          <div
            onClick={() => {
              setFilterCity("");
              setShowCityList(false);
            }}
            className="py-1 text-red-500 cursor-pointer"
          >
            Clear
          </div>
        </div>
      )}

      {showNativeList && (
        <div className="p-3 border bg-white rounded-lg shadow mb-3">
          {allNativeCities.map((city) => (
            <div
              key={city}
              onClick={() => {
                setFilterNative(city);
                setShowNativeList(false);
              }}
              className="py-1 cursor-pointer hover:bg-gray-100"
            >
              {city}
            </div>
          ))}
          <div
            
            className="py-1 text-red-500 cursor-pointer"
          >
            Clear
          </div>
        </div>
      )}

      {loading && <p className="text-blue-500">Syncing...</p>}

      {/* A–Z INDEX ALWAYS ON SIDE */}
      <div className="fixed right-1 top-24 flex flex-col text-xs z-50">
        {alphabet.map((l) => (
          <button
            key={l}
            onClick={() => scrollToLetter(l)}
            className="py-0.5 px-1 text-gray-600 hover:text-black"
          >
            {l}
          </button>
        ))}
      </div>

      {/* MAIN FAMILY LIST */}
      <div className="space-y-5">
        {alphabet.map((letter) => {
          const list = grouped[letter];
          if (!list || !list.length) return null;

          return (
            <div
              key={letter}
              ref={(el) => (letterRefs.current[letter] = el)}
            >
             {/* <h2 className="text-lg font-bold text-gray-700 mb-2">
                {letter}
              </h2>
*/}
              <div className="space-y-3">
                {list.map((f) => {
                  const first = f.members?.[0];

                  // Auto-expand if match found in any OTHER member
                  if (search) {
                    const found = f.members?.some(
                      (m, idx) =>
                        idx > 0 &&
                        m.name.toLowerCase().includes(search.toLowerCase())
                    );
                    if (found && !expanded[f.id]) {
                      setExpanded((p) => ({ ...p, [f.id]: true }));
                    }
                  }

                  return (
                    <div
                      key={f.id}
                      className="p-1 bg-white border rounded-lg shadow-sm"
                    >
                      {/* CITY DETAIL */}
                      <p className="font-semibold mb-1">
                        {f.currentCity} ({f.nativeCity})
                      </p>

                      {/* FIRST MEMBER ROW (CALL → NAME → WA) */}
 
{/* FIRST MEMBER ROW (super compact) */}
{first && (
  <div className="flex items-center gap-4 mb-1">

    {/* Expand button */}
    <button
      onClick={() =>
        setExpanded((p) => ({
          ...p,
          [f.id]: !p[f.id],
        }))
      }
      className="text-blue-600 text-xs leading-none"
    >
      {expanded[f.id] ? "▲" : "▼"}
    </button>

    {/* Call */}
    <a
      href={`tel:${first.mobile}`}
      className="text-green-600 leading-none"
    >
      <FiPhoneCall size={16} />
    </a>

    {/* Name */}
    <span
      className="flex-1 text-sm leading-tight"
      dangerouslySetInnerHTML={{
        __html: highlight(first.name, search),
      }}
    ></span>

    {/* WhatsApp */}
    <a
      href={`https://wa.me/91${first.mobile}`}
      target="_blank"
      className="text-green-600 leading-none"
    >
      <FaWhatsapp size={18} />
    </a>
  </div>
)}


                      {/* EXPANDED MEMBER LIST */}
                      {expanded[f.id] && (
                        <div className="mt-3 border-t pt-2 space-y-3">
                          {f.members?.map((m, i) => (
                            <div
                              key={i}
                              className={`flex items-center justify-between ${
                                search &&
                                m.name
                                  .toLowerCase()
                                  .includes(search.toLowerCase())
                                  ? "bg-yellow-200 rounded-lg"
                                  : ""
                              }`}
                            >
                              <a
                                href={`tel:${m.mobile}`}
                                className="text-green-600"
                              >
                                <FiPhoneCall />
                              </a>

                              <span
                                className="flex-1 px-3 text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: highlight(m.name, search),
                                }}
                              ></span>

                              <a
                                href={`https://wa.me/91${m.mobile}`}
                                className="text-green-600"
                                target="_blank"
                              >
                                <FaWhatsapp size={18} />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
