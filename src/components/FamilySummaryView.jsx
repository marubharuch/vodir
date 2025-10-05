// 🆕 NEW COMPONENT: FamilySummaryView (View Mode for Registered Users)
const FamilySummaryView = ({ profile, members, enterEditMode, loading }) => {
    if (!profile || !profile.id) return null;

    // Determine Family Creator Name
    const creator = profile.members.find(m => m.userId === profile.createdBy)?.name || 'N/A';
    
    // Check if the current user is linked to any member
    const currentUserId = profile.members.find(m => m.userId === profile.createdBy)?.userId || null;
    const canModify = !!currentUserId; // Simple check: if linked, can modify

    return (
        <div className="p-4 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">🏠 ફેમિલી સારાંશ (Family Summary)</h2>
            
            {/* --- Family Details --- */}
            <div className="mb-4 space-y-2 text-gray-700 border-b pb-4">
                <p className="font-mono text-sm">
                    <strong>SRNO/Family ID:</strong> <span className="text-xl font-extrabold text-red-600">{profile.id}</span>
                </p>
                <p><strong>વતન (Native City):</strong> {profile.nativeCity || 'N/A'}</p>
                <p><strong>હાલનું શહેર (Current City):</strong> {profile.currentCity || 'N/A'}</p>
                <p><strong>બનાવનાર (Creator):</strong> {creator}</p>
            </div>

            {/* --- Member List (View Only) --- */}
            <h3 className="text-xl font-bold mt-4 mb-3 text-indigo-700">👥 સભ્યો</h3>
            
            {members.map((member) => (
                <div 
                    key={member.id} 
                    className={`flex justify-between items-center p-3 my-2 rounded-md shadow-sm border 
                        ${member.pending ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-50 border-gray-200'}`
                    }
                >
                    <span className="text-gray-800">
                        {member.gender}: <strong>{member.name}</strong> ({member.countryCode} {member.mobile})
                        {member.pending && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                                ⏳ Pending
                            </span>
                        )}
                    </span>
                </div>
            ))}
            
            {/* --- Modify Button (Action: enterEditMode) --- */}
            {canModify && (
                <button
                    onClick={enterEditMode}
                    className={`w-full text-white px-4 py-2 mt-4 rounded-lg font-bold shadow-md transition duration-150 
                        ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`
                    }
                    disabled={loading}
                >
                    {loading ? "Data Fetching..." : "✏️ Modify Family Data (Refresh)"}
                </button>
            )}
            
        </div>
    );
};