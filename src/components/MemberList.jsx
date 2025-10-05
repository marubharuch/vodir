// src/components/MemberList.jsx (Update this file)

import React from "react";

const MemberList = ({ 
    members, 
    startEditMember, 
    deleteMember,
    // 🆕 New props
    toggleMemberPendingStatus, 
    isUserNonPendingEditor,
}) => {
    return (
        <div className="mt-4 p-3 border rounded-lg bg-white shadow-md">
            <h2 className="text-xl font-bold mb-3 text-gray-800">સભ્ય યાદી (Total: {members.length})</h2>
            
            {members.length === 0 && <p className="text-gray-500">No members added yet.</p>}

            {members.map((member) => (
                <div 
                    key={member.id} 
                    className={`flex justify-between items-center p-3 my-2 rounded-md shadow-sm border 
                        ${member.pending ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-200'}`
                    }
                >
                    <span className="text-gray-800 flex flex-col sm:flex-row sm:items-center">
                        <strong className="text-base">{member.name}</strong> 
                        <span className="text-sm ml-0 sm:ml-2 text-gray-600">
                            ({member.countryCode} {member.mobile})
                        </span>
                        
                        {/* 📌 PENDING STATUS BUTTON/LABEL */}
                        {member.pending && (
                            <button
                                onClick={() => toggleMemberPendingStatus(member.id, member.pending)}
                                disabled={!isUserNonPendingEditor} // Disable if current user isn't an admin
                                className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full 
                                    ${isUserNonPendingEditor ? 'bg-red-500 hover:bg-red-600 cursor-pointer' : 'bg-red-400 cursor-not-allowed'} 
                                    text-white transition duration-150`}
                                title={isUserNonPendingEditor ? "Click to Approve/Verify" : "Pending approval from a verified family member."}
                            >
                                ⏳ Pending
                            </button>
                        )}
                        
                        {/* 📌 OPTIONAL: Button to mark as pending again (for non-pending members) */}
                        {!member.pending && isUserNonPendingEditor && (
                             <button
                                onClick={() => toggleMemberPendingStatus(member.id, member.pending)}
                                className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500 hover:bg-yellow-600 text-white transition duration-150"
                                title="Click to Mark as Pending"
                            >
                                ✅ Approved
                            </button>
                        )}

                    </span>
                    
                    {/* Edit/Delete Buttons */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => startEditMember(member.id)} 
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                            ✏️
                        </button>
                        <button 
                            onClick={() => deleteMember(member.id)} 
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MemberList;