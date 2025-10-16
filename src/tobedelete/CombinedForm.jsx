import React from "react";
import CityInputs from "../CityInputs";
import MemberList from "../MemberList";
import MemberForm from "../MemberForm";
import FamilySummaryView from "../FamilySummaryView";
import LocalForageDataModal from "../LocalForageDataModal";
import JoinFamilyPopup from "../JoinFamilyPopup";
import { useCombinedFormLogic } from "./hooks/useCombinedFormLogic";

const CombinedForm = () => {
  const {
    user,
    profile,
    members,
    setMembers,
    formData,
    setFormData,
    warning,
    setWarning,
    loading,
    setLoading,
    isEditing,
    setIsEditing,
    setIsFinalView,
    selectedMode,
    setSelectedMode,
    selectedMemberId,
    shouldSkipCityInputs,
    isApprovedEditor,
    isViewMode,
    isUserPending,
    canSaveFamily,
    showDataModal,
    localForageDataModalContent,
    showJoinPopup,
    setShowJoinPopup,
    handleJoinFamily,
    enterEditMode,
    handleEditorApproval,
    toggleMemberPendingStatus,
    handleFinish,
    handleUpdate,
    handleAdd, 
    handleCancelEdit,
    startEditMember,
    deleteMember,
    setShowDataModal,
    
    // NEW FETCHED STATES/FUNCTIONS
    isFinalView,
    isEditingCity,
    setIsEditingCity,
    startCityEdit,
    handleCitySave,
    finishAddingMembers,
  } = useCombinedFormLogic();

  // 💡 HELPER: Check if city fields have been filled to allow adding members
  const isCityDataEntered = (formData.nativeCity || "").trim().length > 0 && (formData.currentCity || "").trim().length > 0;
  
  const currentHandleSave = selectedMemberId ? handleUpdate : handleAdd;

  // 💡 HELPER: Check if the user is an approved editor (not pending, not just viewer)
  const isUserNonPendingEditor = isApprovedEditor && !isUserPending;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-4 sm:p-6 space-y-6">
combined form
        {/* View Mode */}
        {user && isViewMode && (
          <FamilySummaryView
            profile={profile}
            user={user}
            members={members}
            setMembers={setMembers}
            setFormData={setFormData}
            setWarning={setWarning}
            setLoading={setLoading}
            setSelectedMode={setSelectedMode}
            setIsEditing={setIsEditing}
            enterEditMode={enterEditMode}
            loading={loading}
            isUserNonPendingEditor={isUserNonPendingEditor} // Changed from isApprovedEditor
            isUserPending={isUserPending}
            // other props...
          />
        )}

        {/* Choice Screen: Only show if no profile AND no mode selected */}
        {user && !profile?.id && selectedMode === null && !loading && (
          <div className="text-center space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">શું કરવા માંગો છો?</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowJoinPopup(true)}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-blue-700"
              >
                🤝 ફેમિલી જોઈન કરો
              </button>
              <button
                 onClick={() => {
                  setSelectedMode("create");
                  setIsEditing(true);
                  setIsEditingCity(true); // STEP 1: City Input Form se shuru karo
                  setIsFinalView(false);
                }}
                className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700"
              >
                🆕 નવું ફેમિલી બનાવો
              </button>
            </div>
          </div>
        )}

        {/* Pending Editor Requests */}
        {profile?.id &&
          isApprovedEditor && // Use isApprovedEditor to check if current user can approve/reject
          Array.isArray(profile.pendingEditorEmails) &&
          profile.pendingEditorEmails.length > 0 && (
            <div className="p-4 border border-blue-300 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">🖊️ Pending Editor Requests</h3>
              <ul className="space-y-2">
                {profile.pendingEditorEmails.map((email) => (
                  <li key={email} className="flex justify-between items-center bg-white border rounded-md p-2">
                    <button
                      // onClick={() => handleEditorApproval(email, false)}
                      className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <span className="text-gray-700 text-sm sm:text-base flex-1 text-center">{email}</span>
                    <button
                      // onClick={() => handleEditorApproval(email, true)}
                      className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}


        {/* Join / Create / Edit Form: Only show if a mode is selected */}
        {user && !isViewMode && selectedMode !== null && (
          <div className="space-y-6">
            
            {/* 1. City Inputs (Shows Label or Input based on isEditingCity) */}
            {!shouldSkipCityInputs && (
                <CityInputs
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={isEditing}
                    isEditingCity={isEditingCity}
                    setIsEditingCity={setIsEditingCity}
                    handleCitySave={handleCitySave}
                    startCityEdit={startCityEdit}
                />
            )}
            
            {/* 2. Member List (Shows data as labels) */}
            <MemberList
                members={members}
                loading={loading}
                isEditing={isEditing && !isFinalView} // Edit buttons show if master edit is on and not in final view
                isApprovedEditor={isApprovedEditor}
                startEditMember={startEditMember}
                deleteMember={deleteMember}
                toggleMemberPendingStatus={toggleMemberPendingStatus}
            />

            {/* 🚀 NEW BUTTON: Add New Family Member */}
            {/* Button dikhega agar edit mode mein ho, city edit nahi ho rahi ho, final view mein na ho, aur koi member select na ho. */}
            {isEditing && !isEditingCity && !isFinalView && !selectedMemberId && isUserNonPendingEditor && (
                <button
                    onClick={handleCancelEdit} // handleCancelEdit sets selectedMemberId(null) and clears the form
                    disabled={loading}
                    className={`
                        mt-4 w-full px-4 py-3 rounded-lg font-semibold shadow transition
                        ${loading
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }
                    `}
                >
                    ➕ Add New Family Member
                </button>
            )}
            
            {/* 3. Member Form: Visibility Condition Updated */}
            {/* Ab MemberForm dikhega agar: City Data entered ho AND City edit na ho rahi ho AND master edit mode ON ho AND final view na ho. */}
            {isCityDataEntered && !isEditingCity && isEditing && !isFinalView && (
              <MemberForm 
               formData={formData}
               setFormData={setFormData} 
               handleMemberSave={currentHandleSave} 
               selectedMember={members.find(m => m.id === selectedMemberId)} 
               editingId={selectedMemberId} 
               handleCancelEdit={handleCancelEdit}
              />
            )}
            
            {/* 4. 'Finish Adding' button (Show after first member, if not in final view) */}
            {(selectedMode === "create" && members.length > 0 && !isFinalView && !selectedMemberId && !isEditingCity) && (
                 <button
                    onClick={finishAddingMembers}
                    className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg font-bold shadow hover:bg-yellow-700"
                  >
                    Finish Adding Members
                </button>
            )}

            {/* 5. Final Save Button (isFinalView) */}
            {isFinalView && (
                <div className="text-center mt-8">
                    <h3 className="text-xl font-semibold text-green-700 mb-4">✅ Family Data Ready!</h3>
                    <button
                        onClick={handleFinish}
                        disabled={!canSaveFamily || loading} 
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-green-700 transition"
                    >
                        💾 Save Family Data
                    </button>
                </div>
            )}
          </div>
        )}
        
        {warning && <p className="text-center text-red-500 font-medium">{warning}</p>}

        <LocalForageDataModal
          show={showDataModal}
          content={localForageDataModalContent}
          //...
        />
      </div>

      {showJoinPopup && <JoinFamilyPopup onClose={() => setShowJoinPopup(false)} onSubmit={handleJoinFamily} />}
    </div>
  );
};

export default CombinedForm;