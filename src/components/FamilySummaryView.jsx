// src/components/FamilySummaryView.jsx
import React from "react";

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

  /* Editor list = UID list */
  const editorList = Array.isArray(profile.editorEmails)
    ? profile.editorEmails.map(clean)
    : [];

  /* Pending = array of objects */
  const pendingList = Array.isArray(profile.pendingEditorEmails)
    ? profile.pendingEditorEmails
    : [];

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
        <div
          key={m.id}
          className="p-2 mb-1 border rounded bg-gray-50"
        >
          <strong>{m.name}</strong> ({m.countryCode} {m.mobile})
        </div>
      ))}

      {/* Pending requests */}
      {isUserEditor && pendingList.length > 0 && (
        <div className="p-3 border rounded bg-blue-50">
          <h3 className="font-bold text-blue-700 mb-2">
            ⏳ Pending Editor Requests
          </h3>

          {pendingList.map((req) => (
            <div
              key={req.uid}
              className="flex justify-between items-center p-2 bg-white border rounded mb-2"
            >
              <button
                onClick={() => handleEditorApproval(req.uid, false)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>

              <span className="flex-1 text-center text-gray-700">
                <b>{req.name || "New User"}</b> <br />
                {req.email} <br />
                {req.mobile}
              </span>

              <button
                onClick={() => handleEditorApproval(req.uid, true)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Approve
              </button>
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
