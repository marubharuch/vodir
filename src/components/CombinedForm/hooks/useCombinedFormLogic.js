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
    // Defensive initialization for CityInputs fix
    nativeCity: "", 
    currentCity: "",
    gender: "",
    name: "",
    countryCode: "+91",
    mobile: "",
  });

  // 🚀 NEW STATES FOR STEP-BY-STEP FLOW
  const [isFinalView, setIsFinalView] = useState(false); // Controls Final Save button visibility
  const [isEditingCity, setIsEditingCity] = useState(false); // CityInputs ka view/edit mode
  // END OF NEW STATES

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
  //const canSaveFamily = !!formData.name && !!formData.mobile;
const canSaveFamily = 
  members.length > 0 && 
  (formData.nativeCity || "").trim().length > 0 && 
  (formData.currentCity || "").trim().length > 0;
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // -------------------------------------------------------------
  // 🚀 MODIFIED/NEW CORE FUNCTIONS FOR THE NEW FLOW
  // -------------------------------------------------------------

  const handleUpdate = () => {
    setMembers((prevMembers) =>
        prevMembers.map((member) =>
            member.id === selectedMemberId 
                ? { ...formData, id: selectedMemberId }
                : member
        )
    );
    // Reset member form fields after update
    setSelectedMemberId(null);
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    // setIsEditing(true) rehta hai, taki MemberList active rahe
    setIsFinalView(true);
  };

  const handleAdd = () => {
    // Add member
    setMembers((prev) => [...prev, { ...formData, id: Date.now() }]);
    
    // Reset form data for next member, but keep city/native
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    setIsFinalView(true);
  }
  
//fdsfsd
const startAddingNewMember = () => {
    // 1. Ensure master edit mode is on
    setIsEditing(true); 
    
    // 2. Clear member-specific fields but KEEP the city/location data
    setFormData(prev => ({ 
        ...prev, 
        gender: "", 
        name: "", 
        mobile: "",
    }));
    
    // 3. Ensure no existing member is selected for editing
    setSelectedMemberId(null);
    
    // 4. Hide the final "Save Family Data" button while the user is filling the form
    setIsFinalView(false); 
    
    console.log("Starting New Member Entry...");
};


  const startEditMember = (id) => { 
    setSelectedMemberId(id);
    setIsEditing(true); // Master edit mode ON
    setIsFinalView(false); // Agar final view mein the, toh bahar niklo
    // Load member data into formData
    const memberToEdit = members.find(m => m.id === id);
    if (memberToEdit) {
      setFormData(prev => ({ ...prev, ...memberToEdit }));
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedMemberId(null);
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    // Agar create mode mein the aur cancel kiya, toh wapas choice screen par le jao.
    if (selectedMode === "create") {
      setSelectedMode(null);
    }
  };
  
  const deleteMember = (id) => setMembers((prev) => prev.filter((m) => m.id !== id));

  // 🚀 NEW FUNCTIONS FOR CITY FLOW
  const startCityEdit = () => {
    setIsEditingCity(true);
    setIsFinalView(false); // Final view se bahar niklo
    setIsEditing(true); // Master edit mode ON
  };

  const handleCitySave = () => {
    // City data already formData mein save ho chuka hai (via onChange)
    setIsEditingCity(false);
    // Agar hum create mode mein hain aur members nahi hain, toh ab member form visible hoga.
  };

  const finishAddingMembers = () => {
    // User decides to stop adding/editing members
    setIsEditing(true); // Keep master edit on for the final view
    setIsEditingCity(false); // City edit band
    setSelectedMemberId(null); // Member edit band
    setIsFinalView(true); // Final Save button dikhao
  };

  const handleFamilySaveAndReset = async () => {
    // Execute the external save logic which calls updateProfile on success
    const success = await handleFinish(profile, user, updateProfile, members, formData, setMembers, setWarning, setLoading);
console.log("handle family save")
    // Assuming the imported handler returns something truthy on success
    if (success !== false) { 
        // ✅ CRITICAL FIXES: Reset local states to force transition to FamilySummaryView
        setIsEditing(false); 
        setIsFinalView(false);
        setSelectedMode(null); 
    }
    return success;
};
  // -------------------------------------------------------------

  useEffect(() => {}, [user]);

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
    // 🚀 NEW RETURN VALUES
    isFinalView,
    setIsFinalView,
    isEditingCity,
    setIsEditingCity,
    startCityEdit,
    handleCitySave,
    finishAddingMembers,
    // EXISTING HANDLERS
    handleJoinFamily: (srno, mobile) => handleJoinFamily(srno, mobile, user, setWarning, setLoading),
    enterEditMode: () => enterEditMode(profile, user, updateProfile, setMembers, setFormData, setWarning, setLoading, setSelectedMode, setIsFinalView,setIsEditing),
    handleEditorApproval: (email, approve) => handleEditorApproval(email, approve, profile, updateProfile, setWarning, setLoading),
    toggleMemberPendingStatus: (memberId, pending) => toggleMemberPendingStatus(memberId, pending, profile, updateProfile, setWarning, setLoading, setMembers),
    handleFinish: handleFamilySaveAndReset,
    handleCancelEdit,
    handleAdd,
    startAddingNewMember,
    startEditMember,
    handleUpdate, 
    deleteMember,
  };
}