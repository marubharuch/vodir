// src/components/MemberList.jsx (CRITICAL UPDATE)

import React from "react";

const MemberList = ({ 
    members, 
    startEditMember, 
    deleteMember,
    toggleMemberPendingStatus, 
    isUserNonPendingEditor,
    isEditMode = true,
}) => {
    return (
        <div className="mt-4 p-3 border rounded-lg bg-white shadow-md">
            memberlist
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
                        
                        {/* 📌 PENDING STATUS BUTTON/LABEL (Only show if member.pending is TRUE) */}
                        {member.pending && (
                            <button
                                // Use a simple label if not in edit mode (like in FamilySummaryView)
                                disabled={!isEditMode || !isUserNonPendingEditor} 
                                onClick={() => isEditMode && isUserNonPendingEditor && toggleMemberPendingStatus(member.id, member.pending)}
                                className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full 
                                    ${(isEditMode && isUserNonPendingEditor) ? 'bg-red-500 hover:bg-red-600 cursor-pointer' : 'bg-red-400 cursor-default'} 
                                    text-white transition duration-150`}
                                title={isUserNonPendingEditor ? "Click to Approve/Verify" : "Pending approval from a verified family member."}
                            >
                                ⏳ Pending
                            </button>
                        )}
                        
                        {/* 🛑 REMOVED: The logic for showing the "Approved" button is removed, 
                             as requested. If member.pending is false, nothing is displayed here. */}

                    </span>
                    
                    {/* Edit/Delete Buttons are ONLY visible if isEditMode is true */}
                    {isEditMode && ( 
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
                    )}
                </div>
            ))}
        </div>
    );
};

export default MemberList;