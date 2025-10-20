// src/components/CombinedForm.jsx
import React, { useState, useEffect } from "react";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import { datastore, db } from "../firebase";
import localforage from "localforage";
import { doc, collection, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, runTransaction, get, set } from "firebase/database";

import CityInputs from "./CityInputs";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";
import FamilySummaryView from "./FamilySummaryView";
import JoinFamilyPopup from "./JoinFamilyPopup";

import LocalForageDataModal from "./LocalForageDataModal";

// ----------------------------------------------------------------------
// 🚀 MAIN COMPONENT: CombinedForm
// ----------------------------------------------------------------------
const CombinedForm = () => {
  console.log("old combine form")
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();

  const [showDataModal, setShowDataModal] = useState(false);
  const [localForageDataModalContent, setLocalForageDataModalContent] = useState('');
const [showJoinPopup, setShowJoinPopup] = useState(false);

  // ✅ States
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
  const [isEditing, setIsEditing] = useState(false); // 📌 Used as the Edit/View Mode toggle
  const [editingId, setEditingId] = useState(null);
  
  // 🆕 NEW STATE: To control the initial choice (null: choice screen, 'join', 'create')
  const [selectedMode, setSelectedMode] = useState(null); 
  
  // 🆕 NEW STATE: To skip City Inputs when linking member after RTDB check
  const [shouldSkipCityInputs, setShouldSkipCityInputs] = useState(false); 

  // 📌 Derived States
  // 🛑 MODIFIED: isJoinMode now depends on selectedMode or shouldSkipCityInputs
  const isJoinMode = selectedMode === 'join' || shouldSkipCityInputs;
  const isViewMode = profile?.id && !isEditing; 
  
  // 🆕 Linking Mode (when we only need phone/mobile)
  const isLinkingMode = isJoinMode;
  
  // User permissions checks
  // 🛑 MODIFIED: Using profile.editorEmails for strong editor check
  const isApprovedEditor = profile?.id && profile?.editorEmails?.includes(user?.email);

  const isUserNonPendingEditor = profile?.id && members.some(
      m => m.userId === user?.uid && m.pending !== true
  );
  const isUserPending = profile?.id && members.some(
      m => m.userId === user?.uid && m.pending === true
  );

  // 🛑 FIX: Updated canAdd logic based on linking mode
  const canAdd = isLinkingMode
    ? ( // If linking an existing profile, only check for mobile
        formData.countryCode.startsWith("+") && 
        formData.mobile.trim()
      )
    : ( // If creating a NEW family or updating, check all required member fields
        formData.gender &&
        formData.name.trim() &&
        formData.countryCode.startsWith("+") &&
        formData.mobile.trim()
      );


  // ✅ HYBRID FETCH: On mount / profile change => Family fetch karo 
  // src/components/CombinedForm.jsx

// ... (existing code) ...

  // ✅ HYBRID FETCH: On mount / profile change => Family fetch karo 
  useEffect(() => {
    const fetchFamilyProfile = async () => {
      setLoading(true);
      setShouldSkipCityInputs(false); // Reset skip flag
      setSelectedMode(null); // Start with no mode selected

      if (user) {
        try {
            const srnoRef = ref(db, `users/${user.uid}/familySrno`);
            const srnoSnapshot = await get(srnoRef);
            const familySrno = srnoSnapshot.val();
            
            // Check if profile is loaded from localforage (context already did this)
            const localProfileExists = !!profile?.id;
            const localTimestamp = profile?.lastUpdateTimestamp || 0; // Localforage time
            
            if (familySrno) {
                const familyDocRef = doc(datastore, "families", familySrno.toString());
                
                // 🆕 1. Read RTDB Summary first (Fast read)
                const rtdbSummaryRef = ref(db, `familyDetails/${familySrno}`);
                const rtdbSummarySnap = await get(rtdbSummaryRef);
                const rtdbSummary = rtdbSummarySnap.val();
                
                const rtdbTimestamp = rtdbSummary?.lastUpdateTimestamp || 0;

                // 2. Check for staleness: RTDB time is newer than local time
                const isLocalStale = rtdbTimestamp > localTimestamp;

                if (isLocalStale || !localProfileExists) {
                    // CACHE MISS / STALE / First Load: Read full Firestore doc (This costs money)
                    console.log("CACHE MISS: Fetching from Firestore.");
                    
                    const familyDocSnap = await getDoc(familyDocRef);

                    if (familyDocSnap.exists()) {
                        const familyData = { id: familyDocSnap.id, ...familyDocSnap.data() };
                        const currentMembers = familyData.members || [];
                        const isUserLinked = currentMembers.some(m => m.userId === user.uid);
                        
                        // 🛑 Update LocalForage with new timestamp
                        const currentLocalTime = Date.now();
                        const localDataToSave = {
                            ...familyData, 
                            lastUpdateTimestamp: currentLocalTime, // Set the new local time
                            updatedAt: currentLocalTime,
                        };
                        
                        await updateProfile(localDataToSave); // Update context with latest from firestore
                        setMembers(currentMembers);

                        if (isUserLinked) {
                            setIsEditing(false); // View Mode
                            setWarning(`✅ Family ${familyDocSnap.id} synced via RTDB and Firestore.`);
                        } else {
                            // Found family, but user is NOT linked. Force a member-linking flow (Join Mode).
                            setIsEditing(true); 
                            setShouldSkipCityInputs(true); 
                            setJoinSrno(familyDocSnap.id); 
                            setSelectedMode('join'); 
                            setWarning("✅ Family found. Please enter your mobile number to link your profile.");
                        }
                    } else {
                        // RTDB index found, but Firestore doc missing. Show choice screen.
                        setIsEditing(false); 
                        setShouldSkipCityInputs(false); 
                        setSelectedMode(null);
                        setWarning("⚠️ RTDB index mila, par family data Firestore mein nahi mila. Naya family banao.");
                    }
                } else {
                    // 3. CACHE HIT: Local data is fresh. Skip Firestore read!
                    console.log("CACHE HIT: Local data is fresh. Skipping Firestore read.");
                    // Data is already in profile context (loaded from localforage). Sync local state.
                    setFormData((s) => ({
                        ...s,
                        nativeCity: profile.nativeCity || "",
                        currentCity: profile.currentCity || "",
                    }));
                    setMembers(profile.members || []);
                    setIsEditing(false); // View Mode
                    setWarning(`✅ Family ${familySrno} synced. Local data is fresh.`);
                }
            } else {
                // No family found -> set to Choice Mode
                setIsEditing(false); 
                setShouldSkipCityInputs(false); 
                setSelectedMode(null); 
                setWarning("⚠️ No family found. Create a new one or Join (SRNO).");
            }
        } catch (err) {
            console.error("RTDB/Firestore fetch error:", err);
            setWarning("⚠️ Data fetch error. Check console.");
            setSelectedMode(null);
        }
      } else {
        setIsEditing(false);
        setSelectedMode(null);
        setWarning("⚠️ Log in to create or join a family.");
      }
      setLoading(false);

    };

    if (!user) {
        setWarning("⚠️ Log in to create or join a family.");
        setLoading(false);
        setSelectedMode(null);
    } else {
        fetchFamilyProfile();
    }
  }, [profile?.lastUpdateTimestamp, profile?.id, user, updateProfile]); // 🛑 Dependency change

// ... (rest of the file up to enterEditMode)
  
  // 🛑 enterEditMode function (Fixed ReferenceError)
 // ... (existing code) ...
  // 🛑 enterEditMode function (Now acts as the Sync/Refresh button)
  const enterEditMode = async () => {
    // 🛑 NEW CHECK: Check against the strong editorEmails array
    if (!isApprovedEditor) {
        setWarning("❌ તમને આ ફેમિલી એડિટ કરવાની પરવાનગી નથી. કૃપા કરીને એડિટરની મંજૂરી મેળવો.");
        return;
    }
    
    setLoading(true);
    setWarning("");
    setShouldSkipCityInputs(false); // Ensure city inputs show if we manually enter edit mode
    setSelectedMode('create'); // Set mode to create/edit

    try {
        if (profile?.id) {
            const familyDocRef = doc(datastore, "families", profile.id);
            const familyDocSnap = await getDoc(familyDocRef); // <-- Force Firestore Read (Sync)

            if (familyDocSnap.exists()) {
                const familyData = { id: familyDocSnap.id, ...familyDocSnap.data() };
                
                // 🛑 Update LocalForage with new timestamp after manual sync
                const currentLocalTime = Date.now();
                const localDataToSave = {
                    ...familyData,
                    lastUpdateTimestamp: currentLocalTime, // Set the new local time
                    updatedAt: currentLocalTime,
                };
                
                await updateProfile(localDataToSave); 
                setMembers(familyData.members || []);
                
                setFormData(s => ({ 
                    ...s, 
                    nativeCity: familyData.nativeCity || "",
                    currentCity: familyData.currentCity || "",
                }));
                
                setIsEditing(true);
                setWarning("✅ Data Refreshed from Firestore. You are now in EDIT mode.");
            } else {
                setWarning("⚠️ Family data not found in Firestore. Please contact admin.");
            }
        }
    } catch (err) {
        console.error("Error refreshing data for edit:", err);
        setWarning("⚠️ Failed to refresh data. Check connection.");
    } finally {
        setLoading(false);
    }
  };
// ... (rest of the file)


  const showLocalForageDataModal = async () => {
    // ... (modal logic remains the same) ...
    try {
      const localForageKey = ``profileData_${user.uid}`_${user.uid}`;
      const allData = await localforage.getItem(localForageKey);
      const content = JSON.stringify(allData, null, 2);
      
      setLocalForageDataModalContent(content); 
     // setShowDataModal(true); 
      
    } catch (err) {
      console.error("Error retrieving all LocalForage data:", err);
      setLocalForageDataModalContent(`Error retrieving data: ${err.message}`);
      //setShowDataModal(true);
    }
  };
  // new
  const handleJoinFamily = async (srno, mobile) => {
  setShowJoinPopup(false);
  setLoading(true);
  setWarning("");

  try {
    const familyRef = doc(datastore, "families", srno.toString());
    const familySnap = await getDoc(familyRef);

    if (!familySnap.exists()) {
      setWarning(`❌ SRNO ${srno} માટે કોઈ ફેમિલી મળી નથી.`);
      return;
    }

    const familyData = familySnap.data();
    const members = Array.isArray(familyData.members) ? familyData.members : [];

    // 🧩 Step 1: Check if mobile matches
    const matchedMember = members.find(
      (m) => m.mobile?.toString() === mobile.toString()
    );

    if (!matchedMember) {
      setWarning("❌ દાખલ કરેલો મોબાઈલ નંબર આ ફેમિલીમાં મળ્યો નથી.");
      return;
    }

    // 🧩 Step 2: Check editor status
    const existingPending = Array.isArray(familyData.pendingEditorEmails)
      ? familyData.pendingEditorEmails
      : [];
    const existingEditors = Array.isArray(familyData.editorEmails)
      ? familyData.editorEmails
      : [];

    if (existingEditors.includes(user.email)) {
      setWarning("✅ તમે પહેલેથી જ એડિટર છો.");
      return;
    }

    if (existingPending.includes(user.email)) {
      setWarning("⏳ તમારી વિનંતી પહેલેથી પેન્ડિંગ છે.");
      return;
    }

    // 🧩 Step 3: Add to pending editors in Firestore
    const updatedPending = [...existingPending, user.email];
    await updateDoc(familyRef, {
      pendingEditorEmails: updatedPending,
      updatedAt: serverTimestamp(),
    });

    // 🧩 Step 4: Link SRNO in RTDB for future syncs
    const userIndexRef = ref(db, `users/${user.uid}/familySrno`);
    await set(userIndexRef, srno.toString());

    // 🧩 Step 5: Success message
    setWarning(`✅ તમારી એડિટર રિક્વેસ્ટ મોકલાઈ ગઈ છે!`);
  } catch (err) {
    console.error("Join Family Error:", err);
    setWarning("⚠️ Family join દરમ્યાન ભૂલ થઈ. Console તપાસો.");
  } finally {
    setLoading(false);
  }
};



  // ✅ handleAdd/handleMemberSave (MemberForm se call hoga)
  const handleAdd = () => {
    
    // 1. City Check (Only for New Family Creation)
    const isNewFamilyCreation = !profile?.id && selectedMode === 'create'; // Use selectedMode

    if (isNewFamilyCreation && (!formData.nativeCity.trim() || !formData.currentCity.trim())) {
        setWarning("⚠️ કૃપા કરીને પહેલા વતન અને હાલનું શહેર ભરો.");
        return;
    }
    
    // 2. Member Field Check (Uses the full canAdd logic)
    if (!canAdd) {
      // In Join Mode, canAdd check is simplified, so this warning is only for Create/Edit
      setWarning("⚠️ કૃપા કરીને સભ્યની તમામ વિગતો ભરો.");
      return;
    }
    setWarning("");
    console.log("MEMBER ACTION: Adding/Updating a single member. Linking Mode:", isLinkingMode);

    if (editingId) {
      // Standard member update
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, ...formData, name: formData.name.trim() }
            : m
        )
      );
      setEditingId(null);
    } else {
      // 3. New Member Logic (Only in Create/Edit mode, as Join uses handleFinish logic)
      
      if (isLinkingMode) {
          setWarning("❌ જોઈન મોડમાં સભ્યોને સીધા અહીં ઉમેરી શકાતા નથી. તમારો મોબાઈલ નંબર દાખલ કરીને રિક્વેસ્ટ મોકલો.");
          return;
      }
      
      const newMemberData = {
          id: crypto.randomUUID(),
          userId: user.uid,
          gender: formData.gender, 
          name: formData.name.trim(), 
          countryCode: formData.countryCode,
          mobile: formData.mobile,
          pending: false, // In Create/Edit mode, new members by editor are not pending
      };
      
      // Add as a brand new member
      setMembers((prev) => [
          ...prev,
          newMemberData, 
      ]);
      
    }

    // Clear form fields after save/update
    setFormData((s) => ({
      ...s,
      gender: "",
      name: "",
      countryCode: "+91",
      mobile: "",
    }));
  };

  // 🆕 New function to handle member edit cancellation
  const handleCancelEdit = () => {
      setEditingId(null);
      setFormData((s) => ({
        ...s,
        gender: "",
        name: "",
        countryCode: "+91",
        mobile: "",
      }));
      setWarning("");
      // Switch back to View Mode if a profile exists
      if (profile?.id) {
          setIsEditing(false);
          setShouldSkipCityInputs(false); 
          setSelectedMode(null);
      } else {
          // If cancelling from initial create/join screens
          setSelectedMode(null);
          setJoinSrno("");
      }
  };
  
  // 🚀 LOGIC: Toggle Pending Status (Approve/Reject)
  const toggleMemberPendingStatus = async (memberId, currentPendingStatus) => {
    // 🛑 Check against strong editor flag
    if (!profile?.id || !isApprovedEditor) {
        setWarning("⚠️ તમને આ સભ્યની સ્થિતિ બદલવાની પરવાનગી નથી.");
        return;
    }
    
    // ... (rest of toggleMemberPendingStatus logic remains the same) ...
    const action = currentPendingStatus ? "Approve" : "Mark as Pending";
    const confirmMessage = `Do you want to ${action} this member?`;
    if (!window.confirm(confirmMessage)) {
        return;
    }

    setLoading(true);
    const newPendingStatus = !currentPendingStatus;
    const familyIdToSave = profile.id;
    const familiesRef = collection(datastore, "families");

    try {
        const updatedMembers = members.map(m => 
            m.id === memberId ? { ...m, pending: newPendingStatus } : m
        );

        setMembers(updatedMembers); // Optimistic UI update

        await updateDoc(doc(familiesRef, familyIdToSave), { 
            members: updatedMembers,
            updatedAt: serverTimestamp(),
        });

        const localDataToSave = {
            ...profile,
            members: updatedMembers,
            id: familyIdToSave,
            updatedAt: Date.now(),
        };
        await updateProfile(localDataToSave);

        setWarning(`✅ Member status updated to: ${newPendingStatus ? 'Pending' : 'Approved'}.`);
    } catch (err) {
        setWarning("⚠️ Status update failed. Please try again.");
        console.error("Pending status toggle error:", err);
        setMembers(profile.members || []); // Simple rollback to last good profile
    } finally {
        setLoading(false);
    }
  };

  // ✅ NEW: Function to Approve a pending editor - check is it duplicate....
  const approveEditorRequest = async (emailToApprove) => {
      // 🛑 Check against strong editor flag
      if (!isApprovedEditor) {
          setWarning("⚠️ તમને એડિટરની વિનંતી મંજૂર કરવાની પરવાનગી નથી.");
          return;
      }

      if (!window.confirm(`Do you want to APPROVE editing access for: ${emailToApprove}?`)) {
          return;
      }

      setLoading(true);
      const familyIdToSave = profile.id;
      const familiesRef = collection(datastore, "families");

      try {
          const currentEditors = Array.isArray(profile.editorEmails) ? profile.editorEmails : [];
          const currentPending = Array.isArray(profile.pendingEditorEmails) ? profile.pendingEditorEmails : [];

          if (!currentPending.includes(emailToApprove)) {
              setWarning(`⚠️ ${emailToApprove} is not in the pending list.`);
              setLoading(false);
              return;
          }

          const updatedEditors = [...currentEditors, emailToApprove];
          const updatedPending = currentPending.filter(email => email !== emailToApprove);

          // Update Firestore
          await updateDoc(doc(familiesRef, familyIdToSave), {
              editorEmails: updatedEditors,
              pendingEditorEmails: updatedPending,
              updatedAt: serverTimestamp(),
          });

          // Update Local State (Profile Context)
          const localDataToSave = {
              ...profile,
              editorEmails: updatedEditors,
              pendingEditorEmails: updatedPending,
              updatedAt: Date.now(),
          };
          await updateProfile(localDataToSave); 

          setWarning(`✅ ${emailToApprove} is now an APPROVED editor.`);

      } catch (err) {
          setWarning("⚠️ Editor approval failed. Please try again.");
          console.error("Editor approval error:", err);
      } finally {
          setLoading(false);
      }
  };
//
// ✅ Unified Approve/Reject handler for editor requests
const handleEditorApproval = async (email, approve) => {
  if (approve) {
    // ✅ Approve editor
    await approveEditorRequest(email);
  } else {
    // ❌ Reject editor request
    if (!isApprovedEditor) {
      setWarning("⚠️ તમને એડિટરની વિનંતી રદ કરવાની પરવાનગી નથી.");
      return;
    }

    if (!window.confirm(`Do you want to REJECT editing access for: ${email}?`)) {
      return;
    }

    setLoading(true);
    const familyIdToSave = profile.id;
    const familiesRef = collection(datastore, "families");

    try {
      const currentPending = Array.isArray(profile.pendingEditorEmails)
        ? profile.pendingEditorEmails
        : [];

      const updatedPending = currentPending.filter((e) => e !== email);

      await updateDoc(doc(familiesRef, familyIdToSave), {
        pendingEditorEmails: updatedPending,
        updatedAt: serverTimestamp(),
      });

      const localDataToSave = {
        ...profile,
        pendingEditorEmails: updatedPending,
        updatedAt: Date.now(),
      };
      await updateProfile(localDataToSave);

      setWarning(`❌ ${email} ની એડિટર વિનંતી રદ કરી.`);
    } catch (err) {
      console.error("Reject editor error:", err);
      setWarning("⚠️ વિનંતી રદ કરવામાં ભૂલ થઈ.");
    } finally {
      setLoading(false);
    }
  }
};


// ... (CombinedForm.jsx માં અન્ય ફંક્શન્સ અને સ્ટેટ્સ પછી)

// 🚀 NEW FUNCTION: handleUpdateFamily
const handleUpdateFamily = async (familyIdToSave, finalMembersToSave, currentUserEmail, profile, formData, userIndexRef, familiesRef, successMessageCallback, setLoadingCallback) => {
    try {
        const existingEditors = Array.isArray(profile.editorEmails) ? profile.editorEmails : [];
        const existingPending = Array.isArray(profile.pendingEditorEmails) ? profile.pendingEditorEmails : [];
        
        let updatedEditors = [...existingEditors];
        let updatedPending = [...existingPending];
        let isApprovalRequest = false;

        // If current user is not an approved editor, ensure their request is captured.
        if (!updatedEditors.includes(currentUserEmail) && !updatedPending.includes(currentUserEmail)) {
             updatedPending.push(currentUserEmail);
             isApprovalRequest = true;
        }
        
        // 🛑 FINAL FIX: createdAt and createdBy MUST be included to avoid deletion error.
        const finalFamilyPayload = {
            nativeCity: formData.nativeCity,
            currentCity: formData.currentCity,
            members: finalMembersToSave,
            updatedAt: serverTimestamp(),
            editorEmails: updatedEditors, 
            pendingEditorEmails: updatedPending,
            
            // ✅ Permanent Fields ને પાછું ઉમેર્યું, જેથી તે ડિલીટ ન થાય.
            createdBy: profile.createdBy,
            createdAt: profile.createdAt, // <--- આ ફિલ્ડ ઉમેરો
            // Note: If 'pin' exists in the document, you must also add: pin: profile.pin,
        };
        
        // 💡 ડીબગિંગ કોડ: ફાયરબેઝને મોકલાતા પેલોડને જુઓ 💡
        const payloadString = JSON.stringify(finalFamilyPayload, null, 2);
        console.log("🔥 PAYLOAD SENT TO FIREBASE (UPDATE):", payloadString);
        alert("PAYLOAD SENT TO FIREBASE (Full JSON in Console):\n\n" + payloadString.substring(0, 400) + "..."); 
        // ----------------------------------------------------

        await updateDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); 
        
        successMessageCallback(`✅ Family ${familyIdToSave} updated successfully!`);
        return { finalFamilyPayload, isApprovalRequest };

    } catch (err) {
        throw new Error(`⚠️ Family Update failed. ${err.message || ''}`);
    } finally {
        setLoadingCallback(false);
    }
};
// ----------------------------------------------------------------------


  // ✅ handleFinish (Family Data Save Karo button se call hoga)
// ... (existing code up to handleFinish)

// ✅ handleFinish (Family Data Save Karo button se call hoga)
const handleFinish = async () => {
  console.log("handleFinish");

  // 🛑 NEW: Email Check
  const currentUserEmail = user?.email;
  if (!currentUserEmail) {
    setWarning("❌ યુઝરનો ઇમેલ મળતો નથી. ફરીથી લોગિન કરો.");
    setLoading(false);
    return;
  }

  if (isUserPending) {
    setWarning("❌ મંજૂરી બાકી હોવાને કારણે તમે ડેટા સેવ કરી શકતા નથી.");
    setLoading(false);
    return;
  }

  setLoading(true);

  let finalMembersToSave = [...members];
  const isJoining = isJoinMode && !profile?.id; // Use isJoinMode

  // 1. FINAL CHECK: If form has unsaved member and we can add (CREATE/EDIT mode only)
  if (canAdd && !editingId && !isJoining) {
    const newMemberData = {
      id: crypto.randomUUID(),
      userId: user.uid,
      gender: formData.gender,
      name: (formData.name || "").trim(),
      countryCode: formData.countryCode,
      mobile: (formData.mobile || "").trim(),
      pending: false,
    };

    finalMembersToSave.push(newMemberData);

    setFormData((s) => ({
      ...s,
      gender: "",
      name: "",
      countryCode: "+91",
      mobile: "",
    }));
  }

  // In join mode, we don't allow creating new member entries locally until check
  if (!isJoining && finalMembersToSave.length === 0) {
    setWarning("⚠️ ઓછામાં ઓછો એક સભ્ય ઉમેરો અથવા SRNO દાખલ કરો.");
    setLoading(false);
    return;
  }

  const masterIndexRef = ref(db, "master/familyIndex");
  const userIndexRef = ref(db, `users/${user.uid}/familySrno`);
  const familiesRef = collection(datastore, "families");
  let successMessage = "";

  try {
    let finalFamilyPayload = {};
    let familyIdToSave = profile?.id;
    let isApprovalRequest = false;
    let existingFamilyDoc = null;

    // --------------------
    // 🤝 JOIN FAMILY LOGIC
    // --------------------
    if (isJoining) {
      const srnoToJoin = (joinSrno || "").trim();
      const existingFamilyRef = doc(familiesRef, srnoToJoin);
      existingFamilyDoc = await getDoc(existingFamilyRef);

      // Get current user's mobile data from form (trimmed)
      const userMobileData = {
        countryCode: formData.countryCode,
        mobile: (formData.mobile || "").trim(),
        name: formData.name ? formData.name.trim() : "Linking User",
        gender: formData.gender || "M/F",
        id: crypto.randomUUID(),
      };

      if (!existingFamilyDoc.exists()) {
        setWarning(`⚠️ Invalid Family ID (SRNO): ${srnoToJoin}. Family not found in Firestore.`);
        setLoading(false);
        return;
      }

      const existingFamilyData = existingFamilyDoc.data();
      familyIdToSave = existingFamilyDoc.id;

      // Work on a copy of members
      let updatedMembers = Array.isArray(existingFamilyData.members) ? [...existingFamilyData.members] : [];

      // STEP 1: Check if mobile number exists in family members
      const mobileMatchIndex = updatedMembers.findIndex(
        (m) =>
          (m.mobile || "").trim() === userMobileData.mobile &&
          (m.countryCode || "") === userMobileData.countryCode
      );

      if (mobileMatchIndex === -1) {
        setWarning("❌ તમે દાખલ કરેલો મોબાઈલ નંબર આ ફેમિલીના કોઈપણ સભ્ય સાથે મેચ થતો નથી.");
        setLoading(false);
        return;
      }

      // STEP 2: Update the member entry with the user's UID and set pending
      updatedMembers[mobileMatchIndex] = {
        ...updatedMembers[mobileMatchIndex],
        userId: user.uid,
        pending: true,
      };

      finalMembersToSave = updatedMembers;

      // EDITOR LOGIC FOR JOINING FAMILY
      const existingEditors = Array.isArray(existingFamilyData.editorEmails) ? existingFamilyData.editorEmails : [];
      const existingPending = Array.isArray(existingFamilyData.pendingEditorEmails)
        ? existingFamilyData.pendingEditorEmails
        : [];

      let updatedPendingEmails = [...existingPending];

      if (!existingEditors.includes(currentUserEmail) && !existingPending.includes(currentUserEmail)) {
        updatedPendingEmails.push(currentUserEmail);
        isApprovalRequest = true;
      }

      finalFamilyPayload = {
        ...existingFamilyData,
        members: finalMembersToSave,
        updatedAt: serverTimestamp(),
        editorEmails: existingEditors,
        pendingEditorEmails: updatedPendingEmails,
      };

      // Update Firestore family doc and set user's family srno index
      await updateDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload);
      await set(userIndexRef, familyIdToSave);

      successMessage = `✅ Family ${familyIdToSave} joined! Your request is pending approval.`;
    } 
    // --------------------
    // CREATE or UPDATE
    // --------------------
    else {
      if (!profile?.id) {
        // --- NEW FAMILY CREATION ---
        let newSrno;
        const result = await runTransaction(masterIndexRef, (currentData) => {
          let data = currentData || { nextSrno: 1 };
          newSrno = data.nextSrno || 1;
          data.nextSrno = newSrno + 1;
          return data;
        });

        if (!result.committed) {
          throw new Error("Failed to commit RTDB transaction for SRNO. Please retry.");
        }

        familyIdToSave = newSrno.toString();

        finalFamilyPayload = {
          nativeCity: formData.nativeCity,
          currentCity: formData.currentCity,
          members: finalMembersToSave.map((m) => ({ ...m, pending: false })),
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          editorEmails: [currentUserEmail],
          pendingEditorEmails: [],
        };

        await setDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload);
        await set(userIndexRef, familyIdToSave);
        successMessage = `✅ New Family created! ID (SRNO): ${familyIdToSave}`;

        // 🚀 RTDB SUMMARY WRITE for NEW FAMILY
        const rtdbSummaryRef = ref(db, `familyDetails/${familyIdToSave}`);
        const totalMembers = finalMembersToSave.length;
        const secondMember = finalMembersToSave[1]?.name || "";

        await set(rtdbSummaryRef, {
          lastUpdateTimestamp: Date.now(),
          nativeCity: finalFamilyPayload.nativeCity,
          currentCity: finalFamilyPayload.currentCity,
          secondMemberName: secondMember,
          totalMembers: totalMembers,
        });
      } else {
        // 🔄 UPDATE Existing family via dedicated function
        familyIdToSave = profile.id;

        const result = await handleUpdateFamily(
          familyIdToSave,
          finalMembersToSave,
          currentUserEmail,
          profile,
          formData,
          userIndexRef,
          familiesRef,
          (msg) => {
            successMessage = msg;
          },
          setLoading
        );

        finalFamilyPayload = result.finalFamilyPayload;
        isApprovalRequest = result.isApprovalRequest;

        // 🚀 RTDB SUMMARY WRITE for UPDATE
        const rtdbSummaryRef = ref(db, `familyDetails/${familyIdToSave}`);
        const totalMembers = finalMembersToSave.length;
        const secondMember = finalMembersToSave[1]?.name || "";

        await set(rtdbSummaryRef, {
          lastUpdateTimestamp: Date.now(),
          nativeCity: finalFamilyPayload.nativeCity,
          currentCity: finalFamilyPayload.currentCity,
          secondMemberName: secondMember,
          totalMembers: totalMembers,
        });
      }
    }

    // 5. Local State Update (Saves to localforage)
    const currentLocalTime = Date.now();
    const localDataToSave = {
      ...finalFamilyPayload,
      id: familyIdToSave,
      updatedAt: currentLocalTime,
      createdAt: finalFamilyPayload.createdAt || profile?.createdAt,
      lastUpdateTimestamp: currentLocalTime,
    };

    await updateProfile(localDataToSave);

    // 💡 READ AND DISPLAY THE SAVED JSON
    const localForageKey = ``profileData_${user.uid}`_${user.uid}`;
    const finalSavedData = await localforage.getItem(localForageKey);

    const content = JSON.stringify(finalSavedData, null, 2);
    setLocalForageDataModalContent(content);
    setShowDataModal(true);

    setMembers(finalMembersToSave);
    setIsEditing(isJoining || isApprovalRequest ? true : false);
    setShouldSkipCityInputs(false);
    setSelectedMode(isJoining || isApprovalRequest ? "join" : null);

    if (successMessage) {
      alert(successMessage);
    }
  } catch (err) {
    setWarning(`⚠️ Save failed.`);
    console.error("RTDB/Firestore error:", err);
    alert(`⚠️ Save failed. ${err.message || ""}`);
  } finally {
    setLoading(false);
  }
};

// ... (rest of the file)
  const startEditMember = (id) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id);
    setFormData({
      ...formData,
      gender: m.gender,
      name: m.name,
      countryCode: m.countryCode,
      mobile: m.mobile,
    });
  };

  const deleteMember = (id) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
  };
    
  const isReadyForMembers = 
    profile?.id || 
    (joinSrno.trim().length > 0) || 
    (formData.nativeCity.trim().length > 0 && formData.currentCity.trim().length > 0); 
    
  const canSaveFamily = isReadyForMembers && (members.length > 0 || canAdd);


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-4 sm:p-6 space-y-6">
        {/* View Mode */}
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

        {/* Choice Screen */}
        {user && !profile?.id && selectedMode === null && !loading && (
          <div className="text-center space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              તમે શું કરવા માંગો છો?
            </h2>
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
  isApprovedEditor &&
  Array.isArray(profile.pendingEditorEmails) &&
  profile.pendingEditorEmails.length > 0 && (
    <div className="p-4 border border-blue-300 bg-blue-50 rounded-xl">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">
        🖊️ Pending Editor Requests
      </h3>
      <ul className="space-y-2">
        {profile.pendingEditorEmails.map((email) => (
          <li
            key={email}
            className="flex justify-between items-center bg-white border rounded-md p-2"
          >
            {/* 🔴 Reject button first */}
            <button
              onClick={() => handleEditorApproval(email, false)}
              className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700 disabled:bg-gray-400"
              disabled={loading}
            >
              Reject
            </button>

            {/* 📧 Email in center */}
            <span className="text-gray-700 text-sm sm:text-base font-medium text-center flex-1">
              {email}
            </span>

            {/* 🟢 Approve button last */}
            <button
              onClick={() => handleEditorApproval(email, true)}
              className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400"
              disabled={loading}
            >
              Approve
            </button>
          </li>
        ))}
      </ul>
    </div>
  )}


        {/* Edit / Create / Join Mode */}
        {user &&
          !isViewMode &&
          !(isUserPending && !isLinkingMode) &&
          (selectedMode === "create" || isJoinMode) && (
            <div className="space-y-6">
              {/* City Inputs */}
              {!profile?.id && selectedMode === "create" && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                  <CityInputs
                    formData={formData}
                    setFormData={setFormData}
                    joinSrno={joinSrno}
                    setJoinSrno={setJoinSrno}
                    profile={profile}
                  />
                </div>
              )}

              {/* Join Mode Inputs */}
              {isJoinMode && !profile?.id && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl space-y-4">
                  <h3 className="font-bold text-yellow-800 text-lg">ફેમિલી જોઈન કરો</h3>
                  <div className="space-y-3 max-w-md mx-auto">
                    <label className="block text-sm font-medium text-gray-700">
                      ફેમિલી SRNO
                    </label>
                    <input
                      type="text"
                      value={joinSrno}
                      onChange={(e) => setJoinSrno(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
                      placeholder="દા.ત. 1001"
                      disabled={shouldSkipCityInputs}
                    />
                  </div>
                  <MemberForm formData={formData} setFormData={setFormData}  />
                  {!shouldSkipCityInputs && (
                    <div className="text-center">
                      <button
                        onClick={handleCancelEdit}
                        className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600"
                      >
                        ❌ Cancel & Go Back
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Cancel Edit Button */}
              {profile?.id && isEditing && (
                <div className="text-right">
                  <button
                    onClick={handleCancelEdit}
                    className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600"
                  >
                    ❌ Cancel Edit & View Summary
                  </button>
                </div>
              )}

              {/* Member List */}
              {(profile?.id || members.length > 0) && (
                <div className="overflow-x-auto">
                  <MemberList
                    members={members}
                    startEditMember={startEditMember}
                    deleteMember={deleteMember}
                    toggleMemberPendingStatus={toggleMemberPendingStatus}
                    isUserNonPendingEditor={isApprovedEditor}
                    isEditMode={!isViewMode}
                  />
                </div>
              )}

              {/* Member Form */}
              {selectedMode === "create" &&
                user &&
                (profile?.id || isReadyForMembers) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <MemberForm
                      formData={formData}
                      setFormData={setFormData}
                      handleMemberSave={handleAdd}
                      handleCancelEdit={handleCancelEdit}
                      editingId={editingId}
                    />
                  </div>
                )}

              {/* Save Button */}
              {(profile?.id && isApprovedEditor) ||
              (selectedMode === "create" && canSaveFamily) ||
              (isJoinMode && joinSrno.trim() && formData.mobile.trim()) ? (
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className={`w-full text-white px-4 py-3 rounded-xl font-bold shadow-md text-lg transition-all duration-150 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading
                    ? "સેવ થઈ રહ્યું છે..."
                    : profile?.id
                    ? "ફેરફારો સેવ કરો (Family Update)"
                    : isJoinMode
                    ? "જોઈન રિક્વેસ્ટ મોકલો"
                    : "ડેટા સેવ કરો (Family Create)"}
                </button>
              ) : null}
            </div>
          )}

        {/* Pending User Message */}
        {user && !isViewMode && isUserPending && !isLinkingMode && (
          <p className="text-center p-4 mt-4 text-red-700 bg-red-100 border border-red-300 rounded-xl font-semibold shadow-sm">
            ❌ તમારી ફેમિલી મેમ્બરશિપ હજુ મંજૂર થઈ નથી.
          </p>
        )}

        {/* Warning */}
        {warning && <p className="text-center text-red-500 font-medium">{warning}</p>}

        {/* Modal */}
        <LocalForageDataModal
          show={showDataModal}
          content={localForageDataModalContent}
          onClose={() => setShowDataModal(false)}
          userUid={user?.uid}
        />
      </div>

{showJoinPopup && (
  <JoinFamilyPopup
    onClose={() => setShowJoinPopup(false)}
    onSubmit={handleJoinFamily}
  />
)}



    </div>
  );
};

export default CombinedForm;


