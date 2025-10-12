// src/components/FamilySummaryView.jsx
import React from "react";

const FamilySummaryView = ({ profile, members, enterEditMode, loading, isUserNonPendingEditor, isUserPending }) => {
  if (!profile?.id) return null;

  const creator = members.find(m => m.userId === profile.createdBy)?.name || 'N/A';

  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      family summary
     { /*<h5 className="text-2xl font-bold mb-4 text-indigo-700">🏠 Family</h5>*/}
      <div className="mb-1 space-y-2 border-b pb-1 text-gray-700">
        <p><strong>ID:</strong> <span className="text-red-600 font-bold">{profile.id}</span></p>
<p>-<strong> {profile.currentCity || 'N/A'}
(</strong> {profile.nativeCity || 'N/A'}) </p>

        
        {/*<p><strong>વતન:</strong> {profile.nativeCity || 'N/A'} -<strong>હાલનું શહેર:</strong> {profile.currentCity || 'N/A'}</p>
       */ }<p><strong>બનાવનાર:</strong> {creator}</p>
      </div>
      <h3 className="text- font-bold text-indigo-700 mb-1">👥 MEMBERS</h3>
      {members.map(m => (
        <div key={m.id} className={`p-2 mb-1 border rounded ${m.pending ? "bg-yellow-100" : "bg-gray-50"}`}>
          <strong>{m.name}</strong> ({m.countryCode} {m.mobile})
          {m.pending && <span className="ml-2 text-xs text-red-600">⏳ Pending</span>}
        </div>
      ))}
      {(isUserNonPendingEditor || isUserPending) && (
        <button
          onClick={enterEditMode}
          disabled={loading || isUserPending}
          className={`w-full mt-4 px-4 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isUserPending ? "⏳ Pending Approval" : "✏️ Modify Family Data"}
        </button>
      )}
    </div>
  );
};

export default FamilySummaryView;
