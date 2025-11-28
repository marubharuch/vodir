// src/components/FamilySummaryView.jsx 
import React, { useEffect, useState, useMemo } from "react";

import { ref, get } from "firebase/database";
import { db } from "../firebase";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function clean(str) {
  if (!str) return "";
  return str.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

const FamilySummaryView = ({
  user,
  profile,
  members,
  loading,
  enterEditMode,
  handleEditorApproval,
}) => {
  if (!profile?.id || !user?.uid) return null;

  const uid = clean(user.uid);

  /* Editor list */
  const editorList = Array.isArray(profile.editorEmails)
    ? profile.editorEmails.map(clean)
    : [];

  /* Pending list (UIDs only) — MUST DEFINE BEFORE useEffect */
 const pendingList = useMemo(() => {
  return Array.isArray(profile.pendingEditorEmails)
    ? profile.pendingEditorEmails.map(clean)
    : [];
}, [profile.pendingEditorEmails]);


  /* Final array of objects with user details */
  const [pendingUsers, setPendingUsers] = useState([]);

  /* Fetch user details for pending UIDs */
  useEffect(() => {
    async function loadPendingUserDetails() {
      if (!pendingList || pendingList.length === 0) {
        setPendingUsers([]);
        return;
      }

      const results = [];

      for (const puid of pendingList) {
        try {
          const snap = await get(ref(db, `users/${puid}`));
          if (snap.exists()) {
            results.push({ uid: puid, ...snap.val() });
          } else {
            results.push({
              uid: puid,
              name: "Unknown User",
              email: "N/A",
              mobile: "N/A",
            });
          }
        } catch (err) {
          console.error("Error loading user", puid, err);
        }
      }

      setPendingUsers(results);
    }

    loadPendingUserDetails();
  }, [pendingList]);

  const isCreator = uid === clean(profile.createdBy);
  const isUserEditor = isCreator || editorList.includes(uid);

  return (
    <div className="p-4 border rounded-lg shadow bg-white space-y-4">
      <div className="border-b pb-2 text-gray-700">
        <p>
          <strong>ID:</strong>{" "}
          <span className="text-red-600 font-bold">{profile.id}</span>
        </p>

        <p>
          <strong>City:</strong> {profile.currentCity} ({profile.nativeCity})
        </p>
      </div>

      <h3 className="font-bold text-indigo-700">👥 Members</h3>

      {(profile.members || []).map((m) => (
        <div key={m.id} className="p-2 mb-1 border rounded bg-gray-50">
          <strong>{m.name}</strong> ({m.countryCode} {m.mobile})
        </div>
      ))}

      {/* Pending requests */}
      {isUserEditor && pendingUsers.length > 0 && (
        <div className="p-3">
          <h3 className="font-bold text-blue-700 mb-3 text-lg">
            ⏳ Pending Editor Requests
          </h3>

          {pendingUsers.map((req) => (
            <div
              key={req.uid}
              className="bg-white border rounded-xl shadow p-4 mb-4 flex flex-col"
            >
              {/* User Info */}
              <div className="text-center mb-3">
                <p className="font-semibold text-gray-900 text-base">
                  {req.name || "New User"}
                </p>
                <p className="text-gray-600 text-sm">{req.email}</p>
                <p className="text-gray-600 text-sm">{req.mobile}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => handleEditorApproval(req.uid, false)}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-xl flex-1 font-semibold text-sm"
                >
                  <FaTimesCircle size={18} /> Reject
                </button>

                <button
                  onClick={() => handleEditorApproval(req.uid, true)}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-xl flex-1 font-semibold text-sm"
                >
                  <FaCheckCircle size={18} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isUserEditor || isCreator) && (
        <button
          onClick={enterEditMode}
          className="w-full rounded-lg py-2 font-semibold text-white bg-yellow-600 hover:bg-yellow-700"
        >
          ✏️ Modify Family Data
        </button>
      )}
    </div>
  );
};

export default FamilySummaryView;
