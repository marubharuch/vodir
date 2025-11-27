// src/components/LoginRecoverModal.jsx
import React, { useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

const LoginRecoverModal = ({ show, onClose, onSelectUser }) => {
  if (!show) return null;

  const [srno, setSrno] = useState("");
  const [mobile, setMobile] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!srno.trim()) {
      alert("⚠️ Family SR Number is required.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      /* -------------------------------------------
         1️⃣ Load ONLY editorEmails (allowed public)
      ------------------------------------------- */
      const famSnap = await get(ref(db, `families/${srno}/editorEmails`));

      if (!famSnap.exists()) {
        alert("❌ No family found with this SR Number.");
        setLoading(false);
        return;
      }

      const editorsMap = famSnap.val() || {};
      const editorUIDs = Object.keys(editorsMap);

      if (editorUIDs.length === 0) {
        alert("❌ No registered editors found for this family.");
        setLoading(false);
        return;
      }

      /* -------------------------------------------
         2️⃣ Fetch user profiles for each UID
      ------------------------------------------- */
      let userList = [];

      for (const uid of editorUIDs) {
        const userSnap = await get(ref(db, `users/${uid}`));

        if (!userSnap.exists()) continue;

        const u = userSnap.val();
        userList.push({
          uid,
          name: u.name || "Unknown",
          email: u.email || "",
          mobile: u.mobile || "",
          provider: u.provider || "unknown",
          srno
        });
      }

      if (userList.length === 0) {
        alert("❌ No matching user accounts for these editors.");
        setLoading(false);
        return;
      }

      /* -------------------------------------------
         3️⃣ Optional mobile filtering
      ------------------------------------------- */
      let filtered = userList;

      if (mobile.trim()) {
        filtered = filtered.filter((u) => u.mobile === mobile.trim());

        if (filtered.length === 0) {
          alert("❌ No user found with this mobile number.");
          setLoading(false);
          return;
        }
      }

      /* -------------------------------------------
         4️⃣ Must have email (required for login)
      ------------------------------------------- */
      filtered = filtered.filter((u) => u.email);

      if (filtered.length === 0) {
        alert("❌ User found but email missing. Contact admin.");
        setLoading(false);
        return;
      }

      setResults(filtered);
    } catch (err) {
      console.error("Recover Error:", err);
      alert("❌ Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-md rounded-xl p-5 shadow-xl">
        <h2 className="text-xl font-bold text-indigo-700 mb-3">
          🔍 Recover Login Details
        </h2>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Enter Family SR No (Required)"
          value={srno}
          onChange={(e) => setSrno(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter Mobile Number (Optional)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <button
          onClick={handleSearch}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg"
        >
          {loading ? "Searching…" : "Find My Account"}
        </button>

        {results.length > 0 && (
          <div className="mt-5 space-y-3">
            {results.map((r, i) => (
              <div key={i} className="p-3 border rounded bg-gray-50 shadow-sm">
                <p><strong>Name:</strong> {r.name}</p>
                <p><strong>Email:</strong> {r.email}</p>
                <p><strong>Mobile:</strong> {r.mobile}</p>
                <p><strong>Family SR:</strong> {r.srno}</p>
                <p><strong>Provider:</strong> {r.provider}</p>

                <button
                  onClick={() => onSelectUser(r)}
                  className="mt-3 w-full bg-green-600 text-white py-1.5 rounded"
                >
                  Continue with this account
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="mt-4 w-full text-gray-500 underline">
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginRecoverModal;
