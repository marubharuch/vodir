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
    selectedMode,
    setSelectedMode,
    selectedMemberId,
    startAddingNewMember,
    shouldSkipCityInputs,
    isApprovedEditor,
    isViewMode,
    isUserPending,
    canSaveFamily,
    showDataModal,
    localForageDataModalContent,
    showJoinPopup,
    setShowJoinPopup,
    setShowDataModal,
    isFinalView,
    setIsFinalView,
    isEditingCity,
    setIsEditingCity,
    handleJoinFamily,
    enterEditMode,
    handleEditorApproval,
    toggleMemberPendingStatus,
    handleFinish,
    handleUpdate,
    handleAdd,
    startEditMember,
    deleteMember,
    startCityEdit,
    handleCitySave,
    finishAddingMembers,
    showMemberFormModal,
    handleCancelMemberForm,
  } = useCombinedFormLogic();

  const isCityDataEntered =
    (formData.nativeCity || "").trim().length > 0 &&
    (formData.currentCity || "").trim().length > 0;

  const currentHandleSave = selectedMemberId ? handleUpdate : handleAdd;

  const isUserNonPendingEditor = isApprovedEditor && !isUserPending;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-4 sm:p-6 space-y-6">

        {/* ✅ View Mode */}
        {user && isViewMode && (
          <FamilySummaryView
            profile={profile}
            user={user}
            members={members}
            enterEditMode={enterEditMode}
            isUserNonPendingEditor={isUserNonPendingEditor}
          />
        )}

        {/* ✅ Initial Choice Screen */}
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
                  setIsEditingCity(true);
                  setIsFinalView(false);
                }}
                className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700"
              >
                🆕 નવું ફેમિલી બનાવો
              </button>
            </div>
          </div>
        )}

        {/* ✅ Pending Editor Approval Section */}
        {profile?.id &&
          isApprovedEditor &&
          Array.isArray(profile.pendingEditorEmails) &&
          profile.pendingEditorEmails.length > 0 && (
            <div className="p-4 border border-blue-300 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">🖊️ Pending Editor Requests</h3>
              <ul className="space-y-2">
                {profile.pendingEditorEmails.map((email) => (
                  <li
                    key={email}
                    className="flex justify-between items-center bg-white border rounded-md p-2"
                  >
                    <button className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700">
                      Reject
                    </button>
                    <span className="text-gray-700 text-sm sm:text-base flex-1 text-center">
                      {email}
                    </span>
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
        {user && !isViewMode && selectedMode !== null && (
          <div className="space-y-6">

            {/* 1. City Inputs */}
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

            {/* 2. Member List */}
            <MemberList
              members={members}
              loading={loading}
              isEditing={isEditing && !isFinalView && !showMemberFormModal}
              isApprovedEditor={isApprovedEditor}
              startEditMember={startEditMember}
              deleteMember={deleteMember}
              toggleMemberPendingStatus={toggleMemberPendingStatus}
            />

            {/* 3. Add New Member Button */}
            {isEditing &&
              isCityDataEntered &&
              !isEditingCity &&
             // !isFinalView &&
              !showMemberFormModal && (
                <div className="mt-5 text-center">
                  <button
                    onClick={startAddingNewMember}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
                  >
                    ➕ Add New Member
                  </button>
                </div>
              )}

            {/* 4. Finish Adding Members */}
            {selectedMode === "create" &&
              members.length > 0 &&
              !isFinalView &&
              !showMemberFormModal &&
              !isEditingCity && (
                <button
                  onClick={finishAddingMembers}
                  className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg font-bold shadow hover:bg-yellow-700"
                >
                  Finish Adding Members
                </button>
              )}

            {/* 5. Final Save Button */}
            {isEditing &&
              isCityDataEntered &&
              !isEditingCity &&
             // !isFinalView &&
              !showMemberFormModal && (
              <div className="text-center mt-8">
                <button
                  onClick={handleFinish}
                  disabled={!canSaveFamily || loading}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-green-700 transition"
                >
                  💾 Upload to Server
                </button>
              </div>
            )}
          </div>
        )}

        {/* ✅ Member Form Modal (CRITICAL FIX: Changed prop name) */}
        {showMemberFormModal && (
          <MemberForm
            // FIX: onClose prop is not used by MemberForm.jsx. It expects handleCancelEdit.
            handleCancelEdit={handleCancelMemberForm} // ⬅️ Corrected Prop Name
            formData={formData}
            setFormData={setFormData}
            handleMemberSave={currentHandleSave}
            selectedMember={members.find((m) => m.id === selectedMemberId)}
            editingId={selectedMemberId}
          />
        )}

        {/* ✅ Warning Message */}
        {warning && (
          <p className="text-center text-red-500 font-medium">{warning}</p>
        )}

        {/* ✅ LocalForage Modal */}
        <LocalForageDataModal
          show={showDataModal}
          content={localForageDataModalContent}
        />

        {/* ✅ Join Family Popup */}
        {showJoinPopup && (
          <JoinFamilyPopup
            onClose={() => setShowJoinPopup(false)}
            onSubmit={(srno, mobile) =>
              handleJoinFamily(srno, mobile, user, setShowJoinPopup, setWarning, setLoading)
            }
            warning={warning}
            setWarning={setWarning}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default CombinedForm;