import React from "react";

const FamilySummaryView = ({
  user,
  profile,
  members,
  loading,
  enterEditMode,
  isUserNonPendingEditor,
  isUserPending,
  handleEditorApproval,
}) => {
  if (!profile?.id) return null;
console.log("profile",profile)
  const familyMembers = profile.members || members || [];

  return (
    <div className="p-4 border rounded-lg shadow bg-white space-y-4">

      {/* ========================= */}
      {/* FAMILY HEADER             */}
      {/* ========================= */}
      <div className="border-b pb-2 text-gray-700">
        <p>
          <strong>ID:</strong>{" "}
          <span className="text-red-600 font-bold">{profile.id}</span>
        </p>
        <p>
          <strong>City:</strong> {profile.currentCity} ({profile.nativeCity})
        </p>
      </div>

      {/* ========================= */}
      {/* MEMBERS LIST              */}
      {/* ========================= */}
      <h3 className="font-bold text-indigo-700">👥 Members</h3>

      {familyMembers.map((m) => (
        <div
          key={m.id}
          className={`p-2 mb-1 border rounded ${
            m.pending ? "bg-yellow-100" : "bg-gray-50"
          }`}
        >
          <strong>{m.name}</strong> ({m.countryCode} {m.mobile})
          {m.pending && (
            <span className="ml-2 text-xs text-red-600">⏳ Pending</span>
          )}
        </div>
      ))}

      {/* ========================= */}
      {/* PENDING EDITOR REQUESTS   */}
      {/* ========================= */}
      {isUserNonPendingEditor &&
        Array.isArray(profile.pendingEditorEmails) &&
        profile.pendingEditorEmails.length > 0 && (
          <div className="mt-4 p-3 border rounded bg-blue-50">
            <h3 className="font-bold text-blue-700 mb-2">
              ⏳ Pending Editor Requests
            </h3>

            {profile.pendingEditorEmails.map((email) => (
              <div
                key={email}
                className="flex justify-between items-center p-2 bg-white border rounded mb-2"
              >
                <button
                  onClick={() => handleEditorApproval(email, false)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>

                <span className="flex-1 text-center text-gray-700">
                  {email}
                </span>

                <button
                  onClick={() => handleEditorApproval(email, true)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}

      {/* ========================= */}
      {/* MODIFY BUTTON             */}
      {/* ========================= */}
      {(isUserNonPendingEditor || isUserPending) && (
        <button
          onClick={enterEditMode}
          disabled={loading || isUserPending}
          className="mt-4 w-full bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition"
        >
          {isUserPending ? "⏳ Waiting for Approval" : "✏️ Modify Family Data"}
        </button>
      )}
    </div>
  );
};

export default FamilySummaryView;
