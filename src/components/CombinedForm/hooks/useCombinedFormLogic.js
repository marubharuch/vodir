// src/components/CombinedForm/hooks/useCombinedFormLogic.js
import { useState, useEffect } from "react";
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

  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    nativeCity: "",
    currentCity: "",
    gender: "",
    name: "",
    countryCode: "+91",
    mobile: "",
  });

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
  const isApprovedEditor = profile?.editorEmails?.includes(user?.email);
  const isUserPending = members.some((m) => m.userId === user?.uid && m.pending === true);
  const canSaveFamily = !!formData.name && !!formData.mobile;

  useEffect(() => {
    // You can move your fetchFamilyProfile logic here later if needed.

  }, [user]);






  return {
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
 setSelectedMode, // <--- આને એક્સપોઝ કરો
  setIsEditing,
  //
    setShowJoinPopup,
    handleJoinFamily: (srno, mobile) => handleJoinFamily(srno, mobile, user, setWarning, setLoading),
    enterEditMode: () => enterEditMode(profile, user, updateProfile, setMembers, setFormData, setWarning, setLoading),
    handleEditorApproval: (email, approve) =>
      handleEditorApproval(email, approve, profile, updateProfile, setWarning, setLoading),
    toggleMemberPendingStatus: (memberId, pending) =>
      toggleMemberPendingStatus(memberId, pending, profile, updateProfile, setWarning, setLoading, setMembers),
    handleFinish: () => handleFinish(profile, user, updateProfile, members, formData, setMembers, setWarning, setLoading),
    handleCancelEdit: () => setIsEditing(false),
    handleAdd: () => setMembers((prev) => [...prev, formData]),
    startEditMember: (id) => setIsEditing(true),
    deleteMember: (id) => setMembers((prev) => prev.filter((m) => m.id !== id)),
    setFormData,
    setJoinSrno,
    setShowDataModal,
  };
}
