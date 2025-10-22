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
  const [showMemberFormModal, setShowMemberFormModal] = useState(false); // ⬅️ ADDED: Modal visibility state

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

  const canSaveFamily = 
    members.length > 0 && 
    (formData.nativeCity || "").trim().length > 0 && 
    (formData.currentCity || "").trim().length > 0;
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // 💡 HELPER FUNCTION: Get the current city data for comparison
  const getCurrentCityData = () => ({
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
  });

  // -------------------------------------------------------------
  // 3. useEffect: CAPTURE ORIGINAL STATE (For Change Tracking)
  // -------------------------------------------------------------
  useEffect(() => {
      // CAPTURE ORIGINAL DATA: when entering edit mode
      if (isEditing && profile?.id && originalMembers === null) {
          // Deep clone and sort members array for consistent comparison
          const initialMembers = JSON.parse(JSON.stringify(members));
          initialMembers.sort((a, b) => (a.id > b.id) ? 1 : -1);

          setOriginalMembers(initialMembers);
          setOriginalCityData(getCurrentCityData());
      }
      
      // RESET ORIGINAL DATA: when editing is turned off
      if (!isEditing && originalMembers !== null) {
          setOriginalMembers(null);
          setOriginalCityData(null);
      }
      
  }, [isEditing, profile, members, formData.nativeCity, formData.currentCity, originalMembers]);

  // -------------------------------------------------------------
  // 4. useMemo: CALCULATE HAS CHANGES
  // -------------------------------------------------------------
const hasChanges = useMemo(() => {
    // 1. Initial/New Family Check
    if (!originalMembers || !originalCityData || !profile?.id) {
        // Console Log: In case of new family/initial load
        console.log("Has Changes: TRUE (New Family or Initial Load)");
        return true; 
    }

    // --- 2. City Data Comparison (Declaration of cityChanged) ---
    const cityChanged = (
        formData.nativeCity !== originalCityData.nativeCity ||
        formData.currentCity !== originalCityData.currentCity
    );

    // --- 3. Members Array Comparison (Declaration of membersChanged) ---
    const currentMembers = JSON.parse(JSON.stringify(members));
    
    // Ensure IDs are converted to string for safe localeCompare (Fixes previous TypeError)
    currentMembers.sort((a, b) => 
        (a.id?.toString() || '').localeCompare(b.id?.toString() || '') 
    ); 

    const membersChanged = JSON.stringify(originalMembers) !== JSON.stringify(currentMembers);

    // --- 4. Console Logs (After all declarations) ---
    const finalHasChanges = membersChanged || cityChanged;
    
    console.log("Original Members:", originalMembers);
    console.log("Current Members:", members);
    console.log("City Data Changed:", cityChanged);
    console.log("Members Data Changed:", membersChanged);
    console.log("Final Has Changes:", finalHasChanges);


    // --- 5. Final Result ---
    return finalHasChanges;
    
}, [
    members,
    originalMembers,
    formData.nativeCity,
    formData.currentCity,
    originalCityData,
    profile?.id
]);
  // -------------------------------------------------------------
  // 🚀 CORE FUNCTIONS
  // -------------------------------------------------------------

  const handleUpdate = () => {
    setMembers((prevMembers) =>
        prevMembers.map((member) =>
            member.id === selectedMemberId 
                ? { ...formData, id: selectedMemberId }
                : member
        )
    );
    // Reset member form fields after update and close modal
    setSelectedMemberId(null);
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    setIsFinalView(true);
    setShowMemberFormModal(false); // ⬅️ Close modal
  };

  const handleAdd = () => {
    // Add member
    setMembers((prev) => [...prev, { ...formData, id: Date.now() }]);
    
    // Reset form data for next member, but keep city/native
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    setIsFinalView(true);
    setShowMemberFormModal(false); // ⬅️ Close modal
  }
  
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
    
    // 4. Show modal
    setIsFinalView(false); 
    setShowMemberFormModal(true); // ⬅️ Open modal
  };


  const startEditMember = (id) => { 
    setSelectedMemberId(id);
    setIsEditing(true); // Master edit mode ON
    setIsFinalView(false); // Exit final view to show the form
    setShowMemberFormModal(true); // ⬅️ Open modal
    // Load member data into formData
    const memberToEdit = members.find(m => m.id === id);
    if (memberToEdit) {
      setFormData(prev => ({ ...prev, ...memberToEdit }));
    }
  };
  

  const handleClearForm = () => {
      setFormData(s => ({
          ...s,
          gender: "",
          name: "",
          countryCode: "+91",
          mobile: ""
      }));
  };
  
  // 💡 NEW HANDLER: For the MemberForm's "Cancel" button (રદ કરો)
  const handleCancelMemberForm = () => {
    // 1. Keep master edit mode ON.
    
    // 2. Clear any active member editing selection (This closes the MemberForm UI)
    setSelectedMemberId(null); 
    
    // 3. Clear the form data to ensure partially entered data is gone.
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    
    // 4. Close modal and ensure we return to the list view
    setIsFinalView(false); 
    setShowMemberFormModal(false); // ⬅️ Close modal
  };
  
  // This is the old, unused handler that fully exits editing.
  const handleCloseForm = () => {
    setIsEditing(false); 
    setSelectedMemberId(null); 
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    setIsFinalView(false); 
    if (selectedMode === "create") {
      setSelectedMode(null);
    }
    setIsEditingCity(false);
  };
  
  // 5. MODIFIED: handleCancelEdit to reset change tracking (Used by the FINAL "Cancel" button)
 const handleCancelEdit = () => {
    // 1. Members array को revert करने के लिए DEEP CLONE का उपयोग करें
    if (originalMembers) {
        // JSON.parse(JSON.stringify()) एक ताज़ा, नई कॉपी सुनिश्चित करता है।
        setMembers(JSON.parse(JSON.stringify(originalMembers))); 
    }
    
    // 2. City data को revert करें
    if (originalCityData) {
        setFormData((prev) => ({ 
            ...prev, 
            nativeCity: originalCityData.nativeCity,
            currentCity: originalCityData.currentCity,
        }));
    }
    
    // 3. View states को रीसेट करें (जैसे था वैसे ही रखें)
    setIsEditing(false);
    setSelectedMemberId(null);
    setFormData((prev) => ({ ...prev, gender: "", name: "", mobile: "" }));
    
    // ❌ DO NOT NULLIFY ORIGINAL STATES! (जैसा कि हमने पहले तय किया था)
    // setOriginalMembers(null); // <-- यह लाइन हटाई गई है
    // setOriginalCityData(null); // <-- यह लाइन हटाई गई है
    
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

    // Assuming the imported handler returns something truthy on success
    if (success !== false) { 
        // ✅ CRITICAL FIXES: Reset local states to force transition to FamilySummaryView
        setIsEditing(false); 
        setIsFinalView(false);
        setSelectedMode(null); 
        // Also reset change tracking data upon successful save
        setOriginalMembers(null);
        setOriginalCityData(null);
    }
    return success;
};
  // -------------------------------------------------------------

  useEffect(() => {}, [user]);
// ... अन्य स्टेट्स और फ़ंक्शंस ...


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
    // ⬅️ FIX: Add missing functions to the return object
    startCityEdit, // ⬅️ CRITICAL FIX: Missing function added
    handleCitySave, // ⬅️ Missing function added
    finishAddingMembers, // ⬅️ Missing function added
    showMemberFormModal, // ⬅️ Missing state added
    // 💡 NEW RETURN: The calculated change status
    
    // EXISTING HANDLERS
    handleJoinFamily: (srno, mobile) => handleJoinFamily(srno, mobile, user, setShowJoinPopup,setWarning, setLoading),
    enterEditMode: () => enterEditMode(profile, user, updateProfile, setMembers, setFormData, setWarning, setLoading, setSelectedMode, setIsFinalView,setIsEditing),
    handleEditorApproval: (email, approve) => handleEditorApproval(email, approve, profile, user, updateProfile, setWarning, setLoading),
    toggleMemberPendingStatus: (memberId, pending) => toggleMemberPendingStatus(memberId, pending, profile, updateProfile, setWarning, setLoading, setMembers),
    handleFinish: handleFamilySaveAndReset,
    hasChanges,
    handleCancelEdit, // FINAL 'Cancel' button handler (resets everything)
    handleCloseForm,  // Old handler (not used now)
    handleCancelMemberForm, 
    handleClearForm,    
    handleAdd,
    startAddingNewMember,
    startEditMember,
    handleUpdate, 
    deleteMember,
    
  };
}