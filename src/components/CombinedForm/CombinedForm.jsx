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
            isUserNonPendingEditor={isApprovedEditor}
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
                 // isEditing(true); // Master edit mode ON
                   setIsEditing(true);
                  setIsEditingCity(true); // STEP 1: City Input Form se shuru karo
                    setIsFinalView(false);
                 // isFinalView(false); 
                }}
                className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700"
              >
                🆕 નવું ફેમિલી બનાવો
              </button>
            </div>
          </div>
        )}

        {/* Pending Editor Requests (Corrected and complete block) */}
        {profile?.id &&
          isApprovedEditor &&
          Array.isArray(profile.pendingEditorEmails) &&
          profile.pendingEditorEmails.length > 0 && (
            <div className="p-4 border border-blue-300 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">🖊️ Pending Editor Requests</h3>
              <ul className="space-y-2">
                {profile.pendingEditorEmails.map((email) => (
                  <li key={email} className="flex justify-between items-center bg-white border rounded-md p-2">
                    <button
                      // onClick={...}
                      className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <span className="text-gray-700 text-sm sm:text-base flex-1 text-center">{email}</span>
                    <button
                      // onClick={...}
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
        {user && !isViewMode && selectedMode !== null && ( // <-- FIX APPLIED HERE
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

            {/* 3. Member Form: Show when City Data is entered AND (we are in create mode OR editing a member) AND we are not in the Final Review view. */}
            {/* Note: Member Form should not show when CityInputs is active/editing. */}
            {isCityDataEntered && !isEditingCity && (selectedMode === "create" || selectedMemberId) && !isFinalView && (
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