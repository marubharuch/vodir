import React from "react";

const FamilySummaryView = ({
  user,
  profile,
  updateProfile,
  members,
  setMembers,
  setFormData,
  setWarning,
  setLoading,
  setSelectedMode,
  setIsEditing,
  enterEditMode,
  loading,
  isUserNonPendingEditor,
  isUserPending,
}) => {
  if (!profile?.id) return null;

  const creator = members.find((m) => m.userId === profile.createdBy)?.name || "N/A";
console.log("family summary",members)
  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      
      <div className="mb-1 space-y-2 border-b pb-1 text-gray-700">
        <p>
          <strong>ID:</strong> <span className="text-red-600 font-bold">{profile.id}</span>
        </p>
        <p>
          -<strong> {profile.currentCity || "N/A"} (</strong> {profile.nativeCity || "N/A"})
        </p>
        <p>
          <strong>બનાવનાર:</strong> {creator}
        </p>
      </div>

      <h3 className="text- font-bold text-indigo-700 mb-1">👥 MEMBERS</h3>
      {profile.members.map((m) => (
        <div key={m.id} className={`p-2 mb-1 border rounded ${m.pending ? "bg-yellow-100" : "bg-gray-50"}`}>
          <strong>{m.name}</strong> ({m.countryCode} {m.mobile})
          {m.pending && <span className="ml-2 text-xs text-red-600">⏳ Pending</span>}
        </div>
      ))}
{(isUserNonPendingEditor || isUserPending) && (
        <button
          onClick={enterEditMode}
          // Button tab disabled hoga jab data load ho raha ho ya user pending ho
          disabled={loading || isUserPending} 
          className="mt-4 w-full bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition"
        >
          {/* Button Text */}
          {isUserPending ? "⏳ Waiting for Approval" : "✏️ Modify Family Data"}
        </button>
      )}
      
    </div>
  );
};

export default FamilySummaryView;