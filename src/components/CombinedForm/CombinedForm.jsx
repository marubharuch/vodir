// src/components/CombinedForm/CombinedForm.jsx
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
    formData,
    joinSrno,
    warning,
    loading,
    isEditing,
    selectedMode,
    shouldSkipCityInputs,
    isApprovedEditor,
    isJoinMode,
    isViewMode,
    isUserPending,
    canSaveFamily,
    showDataModal,
    localForageDataModalContent,
    showJoinPopup,
setSelectedMode, // 🆕 NEW
  setIsEditing, 
    // handlers
    setShowJoinPopup,
    handleJoinFamily,
    enterEditMode,
    handleEditorApproval,
    toggleMemberPendingStatus,
    handleFinish,
    handleCancelEdit,
    handleAdd,
    startEditMember,
    deleteMember,
    setFormData,
    setJoinSrno,
    setShowDataModal,
  } = useCombinedFormLogic();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-4 sm:p-6 space-y-6">

        {/* ✅ View Mode */}
        {user && isViewMode && (
          <FamilySummaryView
            profile={profile}
            members={members}
            enterEditMode={enterEditMode}
            loading={loading}
            isUserNonPendingEditor={isApprovedEditor}
            isUserPending={isUserPending}
          />
        )}

        {/* ✅ Choice Screen */}
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
        // Family Create મોડમાં, તમારે ફોર્મ દેખાડવા માટે isEditing ને true કરવું પડશે.
        setIsEditing(true); 
    }}
    className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700"
>
    🆕 નવું ફેમિલી બનાવો
</button>
            </div>
          </div>
        )}

        {/* ✅ Pending Editor Requests */}
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
                      onClick={() => handleEditorApproval(email, false)}
                      className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <span className="text-gray-700 text-sm sm:text-base flex-1 text-center">{email}</span>
                    <button
                      onClick={() => handleEditorApproval(email, true)}
                      className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* ✅ Join / Create / Edit Form */}
        {user && !isViewMode && (
          <div className="space-y-6">
            {/* City Inputs */}
            {!profile?.id && selectedMode === "create" && (
                
              <CityInputs formData={formData} setFormData={setFormData} joinSrno={joinSrno} setJoinSrno={setJoinSrno} />
            )}

            {/* Member List */}
            {(profile?.id || members.length > 0) && (
              <MemberList
                members={members}
                startEditMember={startEditMember}
                deleteMember={deleteMember}
                toggleMemberPendingStatus={toggleMemberPendingStatus}
                isUserNonPendingEditor={isApprovedEditor}
                isEditMode={isEditing}
              />
            )}

            {/* Member Form */}
            {selectedMode === "create" && (
              <MemberForm formData={formData} setFormData={setFormData} handleMemberSave={handleAdd} />
            )}

            {/* Save Button */}
            {canSaveFamily && (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-full text-white px-4 py-3 rounded-xl font-bold shadow-md text-lg bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? "સેવ થઈ રહ્યું છે..." : "સેવ કરો"}
              </button>
            )}
          </div>
        )}

        {warning && <p className="text-center text-red-500 font-medium">{warning}</p>}
        <LocalForageDataModal
          show={showDataModal}
          content={localForageDataModalContent}
          onClose={() => setShowDataModal(false)}
          userUid={user?.uid}
        />
      </div>

      {showJoinPopup && <JoinFamilyPopup onClose={() => setShowJoinPopup(false)} onSubmit={handleJoinFamily} />}
    </div>
  );
};

export default CombinedForm;
