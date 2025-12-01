// src/pages/Boards.jsx
import { useEffect, useState, useRef } from "react";
import localforage from "localforage";
import { ref, get, query, orderByChild, startAt } from "firebase/database";
import { db } from "../firebase";

// Icons
import { FiPhoneCall, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaWhatsapp, FaTimesCircle } from "react-icons/fa";

export default function Boards() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Filter states
  const [filterCity, setFilterCity] = useState("");
  const [filterNative, setFilterNative] = useState("");

  // Dropdown states
  const [openCity, setOpenCity] = useState(false);
  const [openNative, setOpenNative] = useState(false);

  // Search inside dropdown
  const [citySearch, setCitySearch] = useState("");
  const [nativeSearch, setNativeSearch] = useState("");

  const [expanded, setExpanded] = useState({});
  const letterRefs = useRef({});

  const LF_KEY = "families_data";
  const LF_LAST_TS = "families_lastUpdated";
  const [compactMode, setCompactMode] = useState(true);

  function toggleCompact() {
  if (compactMode) {
    // Expand all
    const expandAll = {};
    families.forEach(f => expandAll[f.id] = true);
    setExpanded(expandAll);
  } else {
    // Collapse all
    setExpanded({});
  }
  setCompactMode(!compactMode);
}



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
    oldList.forEach((i) => map.set(i.id, i));
    updatedList.forEach((i) => map.set(i.id, i));
    return [...map.values()];
  }

  const highlight = (t, s) =>
    !s ? t : t.replace(new RegExp(`(${s})`, "gi"), "<mark>$1</mark>");

  // Filter logic
  const filtered = families.filter((f) => {
    if (filterCity && f.currentCity !== filterCity) return false;
    if (filterNative && f.nativeCity !== filterNative) return false;

    if (search) {
      return f.members.some((m) =>
        m.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aName = a.members?.[0]?.name?.toLowerCase() || "";
    const bName = b.members?.[0]?.name?.toLowerCase() || "";
    return aName.localeCompare(bName);
  });

  // Group A-Z
  const alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];
  const grouped = {};
  sorted.forEach((f) => {
    const ch = f.members?.[0]?.name?.[0]?.toUpperCase() || "#";
    const key = /^[A-Z]$/.test(ch) ? ch : "#";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  });

  const scrollToLetter = (l) => {
    const el = letterRefs.current[l];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allCurrentCities = [...new Set(families.map((f) => f.currentCity))].sort();
  const allNativeCities = [...new Set(families.map((f) => f.nativeCity))].sort();

  return (
    <div className="p-3 pb-20">
      

      {/* FILTER BAR */}
      {/* FILTER BAR – MOBILE OPTIMIZED */}
<div className="mb-4">

  {/* ROW 1 – Search input (full width) */}
  <div className="flex mb-2">
    <input
      type="text"
      placeholder="Search member..."
      className="p-2 border rounded-lg text-sm w-full"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* ROW 2 – Three buttons */}
  <div className="flex gap-2">

    {/* CITY SELECT */}
    <div className="relative flex-1">
      <button
        onClick={() => {
          setOpenCity(!openCity);
          setOpenNative(false);
        }}
        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-between"
      >
        {filterCity || "Current City"}
        <FiChevronDown />
      </button>

      {/* CITY DROPDOWN stays same… */}
      {openCity && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50">
          <input
            type="text"
            placeholder="Search..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            className="w-full p-2 border-b text-sm outline-none"
          />
          <div className="max-h-48 overflow-y-auto">
            {allCurrentCities
              .filter((c) =>
                c?.toLowerCase().includes(citySearch.toLowerCase())
              )
              .map((city) => (
                <div
                  key={city}
                  onClick={() => {
                    setFilterCity(city);
                    setOpenCity(false);
                    setCitySearch("");
                  }}
                  className="px-3 py-1 cursor-pointer hover:bg-gray-100 text-sm"
                >
                  {city}
                </div>
              ))}

              

            <div
              onClick={() => {
                setFilterCity("");
                setOpenCity(false);
                setCitySearch("");
              }}
              className="px-3 py-1 cursor-pointer text-red-500 hover:bg-gray-100 text-sm"
            >
              Clear
            </div>
          </div>
        </div>
      )}
    </div>

    {/* NATIVE SELECT */}
    <div className="relative flex-1">
      <button
        onClick={() => {
          setOpenNative(!openNative);
          setOpenCity(false);
        }}
        className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center justify-between"
      >
        {filterNative || "Native City"}
        <FiChevronDown />
      </button>

      {/* NATIVE DROPDOWN stays same… */}
      {openNative && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50">
          <input
            type="text"
            placeholder="Search..."
            value={nativeSearch}
            onChange={(e) => setNativeSearch(e.target.value)}
            className="w-full p-2 border-b text-sm outline-none"
          />
          <div className="max-h-48 overflow-y-auto">
            {allNativeCities
              .filter((c) =>
                c?.toLowerCase().includes(nativeSearch.toLowerCase())
              )
              .map((city) => (
                <div
                  key={city}
                  onClick={() => {
                    setFilterNative(city);
                    setOpenNative(false);
                    setNativeSearch("");
                  }}
                  className="px-3 py-1 cursor-pointer hover:bg-gray-100 text-sm"
                >
                  {city}
                </div>
              ))}

            <div
              onClick={() => {
                setFilterNative("");
                setOpenNative(false);
                setNativeSearch("");
              }}
              className="px-3 py-1 cursor-pointer text-red-500 hover:bg-gray-100 text-sm"
            >
              Clear
            </div>
          </div>
        </div>
      )}
    </div>

    {/* COMPACT/EXPAND TOGGLE */}
<button
  onClick={toggleCompact}
  className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center justify-center"
>
  {compactMode ? "Expand All" : "Compact All"}
</button>


    {/* CLEAR BUTTON */}
    <button
      onClick={() => {
        setSearch("");
        setFilterCity("");
        setFilterNative("");
      }}
      className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm flex items-center justify-center"
    >
      <FaTimesCircle size={18} />
    </button>
  </div>
</div>


      {/* SYNC STATUS */}
      {loading && <p className="text-blue-500">Syncing...</p>}

      {/* A-Z SIDEBAR */}
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

      {/* FAMILY LIST */}
      <div className="space-y-4">
        {alphabet.map((letter) => {
          const list = grouped[letter];
          if (!list || list.length === 0) return null;

          return (
            <div key={letter} ref={(el) => (letterRefs.current[letter] = el)}>
              <div className="space-y-3">
                {list.map((f) => {
                  const first = f.members?.[0];

                  // Auto expand if inner search match
                  if (search) {
                    const match = f.members.some(
                      (m, idx) =>
                        idx > 0 &&
                        m.name?.toLowerCase().includes(search.toLowerCase())
                    );
                    if (match && !expanded[f.id]) {
                      setExpanded((p) => ({ ...p, [f.id]: true }));
                    }
                  }

                  return (
                    <div
                      key={f.id}
                      className="p-2 bg-white border rounded-lg shadow-sm"
                    >
                      {/* HEADER */}
                      <div
                        className="flex items-center justify-between cursor-pointer bg-gray-50 p-2 rounded"
                        onClick={() =>
                          setExpanded((p) => ({
                            ...p,
                            [f.id]: !p[f.id],
                          }))
                        }
                      >
                        <p className="font-semibold">
                          {f.currentCity} ({f.nativeCity})
                        </p>

                        {expanded[f.id] ? (
                          <FiChevronUp size={22} className="text-blue-600" />
                        ) : (
                          <FiChevronDown size={22} className="text-blue-600" />
                        )}
                      </div>

                      {/* FIRST MEMBER */}
                      {first && (
                        <div className="flex items-center gap-3 mt-2 pl-2">
                          <a href={`tel:${first.mobile}`} className="text-green-600">
                            <FiPhoneCall size={18} />
                          </a>

                          <span
                            className="flex-1 text-sm"
                            dangerouslySetInnerHTML={{
                              __html: highlight(first.name, search),
                            }}
                          ></span>

                          <a
                            href={`https://wa.me/91${first.mobile}`}
                            target="_blank"
                            className="text-green-600"
                          >
                            <FaWhatsapp size={20} />
                          </a>
                        </div>
                      )}

                      {/* EXPANDED MEMBERS */}
                      {expanded[f.id] && (
                        <div className="mt-3 border-t pt-2 space-y-2">
                          {f.members.map((m, i) => (
                            <div
                              key={i}
                              className={`flex items-center justify-between p-1 rounded ${
                                search &&
                                m.name.toLowerCase().includes(search.toLowerCase())
                                  ? "bg-yellow-200"
                                  : ""
                              }`}
                            >
                              <a href={`tel:${m.mobile}`} className="text-green-600">
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
                                target="_blank"
                                className="text-green-600"
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
