import { useState, useEffect, useMemo } from "react"; 
import { useProfile } from "../../../context/ProfileContext";
import { useAuth } from "../../../context/AuthContext";
import { handleJoinFamily } from "../handlers/handleJoinFamily";
import { handleFinish } from "../handlers/handleFinish";
import { enterEditMode } from "../handlers/enterEditMode";
import { handleEditorApproval } from "../handlers/handleEditorApproval";
import { toggleMemberPendingStatus } from "../utils/familyHelpers";

export function useCombinedFormLogic() {
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();

  // 🚀 STATES FOR CHANGE TRACKING
  const [originalMembers, setOriginalMembers] = useState(null);
  const [originalCityData, setOriginalCityData] = useState(null);

  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    nativeCity: "", 
    currentCity: "",
    gender: "",
    name: "",
    countryCode: "+91",
    mobile: "",
  });

  // 🚀 NEW STATES FOR STEP-BY-STEP FLOW
  const [isFinalView, setIsFinalView] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [showMemberFormModal, setShowMemberFormModal] = useState(false);

  const [joinSrno, setJoinSrno] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [shouldSkipCityInputs, setShouldSkipCityInputs] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [localForageDataModalContent, setLocalForageDataModalContent] = useState("");
  const [showJoinPopup, setShowJoinPopup] = useState(false);

  const isJoinMode = selectedMode === "join" || shouldSkipCityInputs;
  const isViewMode = profile?.id && !isEditing;

  // ✅ FIX: ensure safe boolean check for logged-in editor
  const isApprovedEditor =
    !!(user?.email && profile?.editorEmails?.includes(user.email));

  const isUserPending = members.some(
    (m) => m.userId === user?.uid && m.pending === true
  );

  const canSaveFamily =
    members.length > 0 &&
    (formData.nativeCity || "").trim().length > 0 &&
    (formData.currentCity || "").trim().length > 0;

  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const getCurrentCityData = () => ({
    nativeCity: formData.nativeCity,
    currentCity: formData.currentCity,
  });

  // -------------------------------------------------------------
  // Capture original state for change tracking
  // -------------------------------------------------------------
  useEffect(() => {
    if (isEditing && profile?.id && originalMembers === null) {
      const initialMembers = JSON.parse(JSON.stringify(members));
      initialMembers.sort((a, b) => (a.id > b.id ? 1 : -1));

      setOriginalMembers(initialMembers);
      setOriginalCityData(getCurrentCityData());
    }

    if (!isEditing && originalMembers !== null) {
      setOriginalMembers(null);
      setOriginalCityData(null);
    }
  }, [
    isEditing,
    profile,
    members,
    formData.nativeCity,
    formData.currentCity,
    originalMembers,
  ]);

  // -------------------------------------------------------------
  // Detect unsaved changes
  // -------------------------------------------------------------
  const hasChanges = useMemo(() => {
    if (!originalMembers || !originalCityData || !profile?.id) return true;

    const cityChanged =
      formData.nativeCity !== originalCityData.nativeCity ||
      formData.currentCity !== originalCityData.currentCity;

    const currentMembers = JSON.parse(JSON.stringify(members));
    currentMembers.sort((a, b) =>
      (a.id?.toString() || "").localeCompare(b.id?.toString() || "")
    );

    const membersChanged =
      JSON.stringify(originalMembers) !== JSON.stringify(currentMembers);

    return cityChanged || membersChanged;
  }, [
    members,
    originalMembers,
    formData.nativeCity,
    formData.currentCity,
    originalCityData,
    profile?.id,
  ]);

  // -------------------------------------------------------------
  // Core Functions
  // -------------------------------------------------------------
  const handleUpdate = () => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === selectedMemberId
          ? { ...formData, id: selectedMemberId }
          : member
      )
    );
    setSelectedMemberId(null);
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    setIsFinalView(true);
    setShowMemberFormModal(false);
  };

  const handleAdd = () => {
    setMembers((prev) => [...prev, { ...formData, id: Date.now() }]);
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    setIsFinalView(true);
    setShowMemberFormModal(false);
  };

  const startAddingNewMember = () => {
    setIsEditing(true);
    setFormData((prev) => ({
      ...prev,
      gender: "",
      name: "",
      mobile: "",
    }));
    setSelectedMemberId(null);
    setIsFinalView(false);
    setShowMemberFormModal(true);
  };

  const startEditMember = (id) => {
    setSelectedMemberId(id);
    setIsEditing(true);
    setIsFinalView(false);
    setShowMemberFormModal(true);
    const memberToEdit = members.find((m) => m.id === id);
    if (memberToEdit) {
      setFormData((prev) => ({ ...prev, ...memberToEdit }));
    }
  };

  const handleClearForm = () => {
    setFormData((s) => ({
      ...s,
      gender: "",
      name: "",
      countryCode: "+91",
      mobile: "",
    }));
  };

  const handleCancelMemberForm = () => {
    setSelectedMemberId(null);
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    setIsFinalView(false);
    setShowMemberFormModal(false);
  };

  const handleCancelEdit = () => {
    if (originalMembers) {
      setMembers(JSON.parse(JSON.stringify(originalMembers)));
    }

    if (originalCityData) {
      setFormData((prev) => ({
        ...prev,
        nativeCity: originalCityData.nativeCity,
        currentCity: originalCityData.currentCity,
      }));
    }

    setIsEditing(false);
    setSelectedMemberId(null);
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));

    if (selectedMode === "create") {
      setSelectedMode(null);
    }
  };

  const deleteMember = (id) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));

  const startCityEdit = () => {
    setIsEditingCity(true);
    setIsFinalView(false);
    setIsEditing(true);
  };

  const handleCitySave = () => setIsEditingCity(false);

  const finishAddingMembers = () => {
    setIsEditing(true);
    setIsEditingCity(false);
    setSelectedMemberId(null);
    setIsFinalView(true);
  };

  const handleFamilySaveAndReset = async () => {
    const success = await handleFinish(
      profile,
      user,
      updateProfile,
      members,
      formData,
      setMembers,
      setWarning,
      setLoading
    );

    if (success !== false) {
      setIsEditing(false);
      setIsFinalView(false);
      setSelectedMode(null);
      setOriginalMembers(null);
      setOriginalCityData(null);
    }
    return success;
  };

  // -------------------------------------------------------------
  // Return all logic to CombinedForm
  // -------------------------------------------------------------
  return {
    user,
    profile,
    members,
    setMembers,
    formData,
    setFormData,
    joinSrno,
    setJoinSrno,
    warning,
    setWarning,
    loading,
    setLoading,
    isEditing,
    setIsEditing,
    selectedMode,
    setSelectedMode,
    selectedMemberId,
    shouldSkipCityInputs,
    isJoinMode,
    isViewMode,
    isApprovedEditor,
    isUserPending,
    canSaveFamily,
    showDataModal,
    setShowDataModal,
    localForageDataModalContent,
    showJoinPopup,
    setShowJoinPopup,
    isFinalView,
    setIsFinalView,
    isEditingCity,
    setIsEditingCity,
    startCityEdit,
    handleCitySave,
    finishAddingMembers,
    showMemberFormModal,
    // ✅ Fixed handlers (pass user correctly)
    handleJoinFamily: (srno, mobile) =>
      handleJoinFamily(srno, mobile, user, setShowJoinPopup, setWarning, setLoading),
    enterEditMode: () =>
      enterEditMode(
        profile,
        user,
        updateProfile,
        setMembers,
        setFormData,
        setWarning,
        setLoading,
        setSelectedMode,
        setIsFinalView,
        setIsEditing
      ),
    // ✅ FIX: Pass `user` to handleEditorApproval
    handleEditorApproval: (email, approve) =>
      handleEditorApproval(email, approve, profile, updateProfile, setWarning, setLoading, user),
    toggleMemberPendingStatus: (memberId, pending) =>
      toggleMemberPendingStatus(
        memberId,
        pending,
        profile,
        updateProfile,
        setWarning,
        setLoading,
        setMembers
      ),
    handleFinish: handleFamilySaveAndReset,
    hasChanges,
    handleCancelEdit,
    handleCancelMemberForm,
    handleClearForm,
    handleAdd,
    startAddingNewMember,
    startEditMember,
    handleUpdate,
    deleteMember,
  };
}
