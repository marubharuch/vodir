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
    updateProfile,
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
    hasChanges,
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
    <>
      {/* 🔥 Global Fullscreen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex flex-col items-center">
            <div className="loader w-10 h-10 animate-spin mb-3"></div>
            <p className="text-gray-700 font-medium">Working… Please wait</p>
          </div>
        </div>
      )}

      {/* Loader CSS */}
      <style>
        {`
          .loader {
            border: 4px solid #e5e7eb;
            border-top-color: #2563eb;
            border-radius: 50%;
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-4 sm:p-6 space-y-6">
          
          {/* VIEW MODE */}
          {user && isViewMode && (
            <FamilySummaryView
              profile={profile}
              user={user}
              members={members}
              loading={loading}
              enterEditMode={enterEditMode}
              isUserNonPendingEditor={isUserNonPendingEditor}
              isUserPending={isUserPending}
              handleEditorApproval={handleEditorApproval}
              updateProfile={updateProfile}
            />
          )}

          {/* FIRST SCREEN */}
          {user && !profile?.id && selectedMode === null && !loading && !isUserPending && (
            <div className="text-center space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                શું કરવા માંગો છો?
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowJoinPopup(true)}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-blue-700"
                >
                  🤝 ફેમિલી જોઈએ કરો
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

          {/* USER PENDING */}
          {user && isUserPending && (
            <div className="text-center p-6 bg-yellow-50 border border-yellow-300 rounded-xl">
              <h2 className="text-lg font-semibold text-yellow-700">
                🕓 તમારી ફેમિલી એડિટર મંજૂરીની રાહમાં છે
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                મંજૂરી મળ્યા બાદ તમે તમારી ફેમિલી માહિતી જોઈ અને સુધારી શકશો.
              </p>
            </div>
          )}

          {/* FAMILY FORM */}
          {user && !isViewMode && selectedMode !== null && (
            <div className="space-y-6">
              
              {/* CITY INPUTS */}
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

              {/* MEMBERS */}
              <MemberList
                members={members}
                loading={loading}
                isEditing={isEditing && !isFinalView && !showMemberFormModal}
                isApprovedEditor={isApprovedEditor}
                startEditMember={startEditMember}
                deleteMember={deleteMember}
                toggleMemberPendingStatus={toggleMemberPendingStatus}
              />

              {/* ADD MEMBER */}
              {isEditing && isCityDataEntered && !isEditingCity && !showMemberFormModal && (
                <div className="mt-5 text-center">
                  <button
                    onClick={startAddingNewMember}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
                  >
                    ➕ Add New Member
                  </button>
                </div>
              )}

              {/* FINISH MEMBERS */}
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

              {/* SAVE */}
              {isEditing &&
                isCityDataEntered &&
                !isEditingCity &&
                hasChanges &&
                !showMemberFormModal && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() =>
                        handleFinish({
                          profile,
                          user,
                          updateProfile,
                          members,
                          formData,
                          setMembers,
                          setWarning,
                          setLoading,
                        })
                      }
                      disabled={!canSaveFamily || loading}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-green-700 transition disabled:opacity-50"
                    >
                      💾 Upload to Server
                    </button>
                  </div>
                )}
            </div>
          )}

          {/* MEMBER FORM */}
          {showMemberFormModal && (
            <MemberForm
              handleCancelEdit={handleCancelMemberForm}
              formData={formData}
              setFormData={setFormData}
              handleMemberSave={currentHandleSave}
              selectedMember={members.find((m) => m.id === selectedMemberId)}
              editingId={selectedMemberId}
            />
          )}

          {/* WARNING */}
          {warning && (
            <p className="text-center text-red-500 font-medium">{warning}</p>
          )}

          {/* LOCALFORAGE MODAL */}
          <LocalForageDataModal
            show={showDataModal}
            content={localForageDataModalContent}
          />

          {/* JOIN FAMILY POPUP */}
          {showJoinPopup && (
            <JoinFamilyPopup
              onClose={() => setShowJoinPopup(false)}
              onSubmit={(srno, mobile) =>
                handleJoinFamily(
                  srno,
                  mobile,
                  user,
                  setShowJoinPopup,
                  setWarning,
                  setLoading
                )
              }
              warning={warning}
              setWarning={setWarning}
              loading={loading}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CombinedForm;
