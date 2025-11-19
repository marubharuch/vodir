import { useState, useEffect, useMemo } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { useAuth } from "../../../context/AuthContext";
import { handleJoinFamily } from "../handlers/handleJoinFamily";
import { handleFinish } from "../handlers/handleFinish";
import { enterEditMode } from "../handlers/enterEditMode";
import { handleEditorApproval as rawEditorApproval } from "../handlers/handleEditorApproval";
import { toggleMemberPendingStatus } from "../utils/familyHelpers";

export function useCombinedFormLogic() {
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    nativeCity: "",
    currentCity: "",
    gender: "",
    name: "",
    countryCode: "+91",
    mobile: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const [showMemberFormModal, setShowMemberFormModal] = useState(false);

  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [localForageDataModalContent, setLocalForageDataModalContent] = useState("");

  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);

  const [isFinalView, setIsFinalView] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [shouldSkipCityInputs, setShouldSkipCityInputs] = useState(false);

  // ============================================
  // PERMISSIONS
  // ============================================

  const isApprovedEditor = Array.isArray(profile?.editorEmails)
    ? profile.editorEmails.includes(user?.email)
    : false;

  const isUserPending = members.some(
    (m) => m.userId === user?.uid && m.pending === true
  );

  const isViewMode = profile?.id && !isEditing;

  // ============================================
  // LOAD MEMBERS FROM PROFILE
  // ============================================

  useEffect(() => {
    if (profile?.members) {
      setMembers(profile.members);
      setFormData((prev) => ({
        ...prev,
        nativeCity: profile.nativeCity || "",
        currentCity: profile.currentCity || "",
      }));
    }
  }, [profile]);

  const canSaveFamily =
    members.length > 0 &&
    (formData.nativeCity || "").trim().length > 0 &&
    (formData.currentCity || "").trim().length > 0;

  // ============================================
  // HANDLER WRAPPERS
  // ============================================

  const wrappedJoinFamily = (srno, mobile) =>
    handleJoinFamily(srno, mobile, user, setShowJoinPopup, setWarning, setLoading);

  const wrappedEditorApproval = (email, approve) =>
    rawEditorApproval(
      email,
      approve,
      profile,
      updateProfile,
      setWarning,
      setLoading,
      user
    );

  const wrappedEnterEditMode = () =>
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
    );

  // ============================================
  // MEMBERS HANDLERS
  // ============================================

  const startAddingNewMember = () => {
    setSelectedMemberId(null);
    setFormData((f) => ({ ...f, gender: "", name: "", mobile: "" }));
    setShowMemberFormModal(true);
    setIsEditing(true);
    setIsFinalView(false);
  };

  const startEditMember = (id) => {
    setSelectedMemberId(id);
    const m = members.find((x) => x.id === id);
    if (m) setFormData((f) => ({ ...f, ...m }));
    setShowMemberFormModal(true);
    setIsEditing(true);
    setIsFinalView(false);
  };

  const handleAdd = () => {
    setMembers((prev) => [...prev, { ...formData, id: Date.now() }]);
    setShowMemberFormModal(false);
  };

  const handleUpdate = () => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMemberId ? { ...formData, id: selectedMemberId } : m
      )
    );
    setShowMemberFormModal(false);
  };

  const deleteMember = (id) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));

  // ============================================
  // RETURN VALUES
  // ============================================

  return {
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

    shouldSkipCityInputs,
    isApprovedEditor,
    isViewMode,
    isUserPending,
    canSaveFamily,

    showDataModal,
    localForageDataModalContent,
    setShowDataModal,

    showJoinPopup,
    setShowJoinPopup,

    isFinalView,
    setIsFinalView,

    isEditingCity,
    setIsEditingCity,

    showMemberFormModal,
    handleCancelMemberForm: () => setShowMemberFormModal(false),

    enterEditMode: wrappedEnterEditMode,
    handleJoinFamily: wrappedJoinFamily,
    handleEditorApproval: wrappedEditorApproval,

    toggleMemberPendingStatus,
    handleFinish,

    hasChanges: true, // simplified

    startAddingNewMember,
    startEditMember,
    handleAdd,
    handleUpdate,
    deleteMember,

    startCityEdit: () => setIsEditingCity(true),
    handleCitySave: () => setIsEditingCity(false),
    finishAddingMembers: () => setIsFinalView(true),
  };
}
