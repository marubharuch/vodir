
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
import LocalForageDataModal from "./LocalForageDataModal";

// Keep your logic and state from the big file here...
// (You can reuse everything from your uploaded CombinedForm.jsx after imports section.)


// ----------------------------------------------------------------------
// 🚀 MAIN COMPONENT: CombinedForm
// ----------------------------------------------------------------------
const CombinedForm = () => {
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();

  const [showDataModal, setShowDataModal] = useState(false);
  const [localForageDataModalContent, setLocalForageDataModalContent] = useState('');

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
  
  // 🆕 NEW STATE: To skip City Inputs when linking member after RTDB check
  const [shouldSkipCityInputs, setShouldSkipCityInputs] = useState(false); 

  // 📌 Derived States
  const isJoinMode = joinSrno.trim().length > 0 && !profile?.id;
  const isViewMode = profile?.id && !isEditing && !isJoinMode; 
  
  // 🆕 Linking Mode (when we only need phone/mobile)
  const isLinkingMode = isJoinMode || shouldSkipCityInputs;
  
  // User permissions checks
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
    : ( // If creating a NEW family, check all fields
        formData.gender &&
        formData.name.trim() &&
        formData.countryCode.startsWith("+") &&
        formData.mobile.trim()
      );


  // ✅ HYBRID FETCH: On mount / profile change => Family fetch karo 
  useEffect(() => {
    const fetchFamilyProfile = async () => {
      setLoading(true);
      setShouldSkipCityInputs(false); // Reset skip flag

      if (profile?.id) {
        // Data already in context/localforage. Sync local state to context.
        setFormData((s) => ({
          ...s,
          nativeCity: profile.nativeCity || "",
          currentCity: profile.currentCity || "",
        }));
        setMembers(profile.members || []);
        // Start in View Mode if a profile exists and we aren't editing
        setIsEditing(false); 
        setWarning("✅ તમારો ફેમિલી ડેટા લોડ થઈ ગયો છે!");
        setLoading(false);
        return;
      }
      
      // Check RTDB index only if no local profile exists
      if (user) {
        try {
            const srnoRef = ref(db, `users/${user.uid}/familySrno`);
            const srnoSnapshot = await get(srnoRef);
            const familySrno = srnoSnapshot.val();

            if (familySrno) {
                const familyDocRef = doc(datastore, "families", familySrno.toString());
                const familyDocSnap = await getDoc(familyDocRef);

                if (familyDocSnap.exists()) {
                    const familyData = { id: familyDocSnap.id, ...familyDocSnap.data() };
                    
                    await updateProfile(familyData); 
                    const currentMembers = familyData.members || [];
                    setMembers(currentMembers);
                    
                    // Check if the logged-in user is already a member
                    const isUserLinked = currentMembers.some(m => m.userId === user.uid);

                    if (isUserLinked) {
                        setIsEditing(false); // Found family & Linked -> View Mode
                        setWarning(`✅ Family ${familyDocSnap.id} synced via RTDB index.`);
                    } else {
                        // Found family, but user is NOT linked. Force a member-linking flow.
                        setIsEditing(true); // Force Edit/Input Mode
                        setShouldSkipCityInputs(true); // 🆕 Skip City Inputs 
                        setJoinSrno(familyDocSnap.id); // Pre-fill SRNO for logic consistency
                        setWarning("✅ Family found. Please enter your mobile number to link your profile.");
                    }
                } else {
                    setIsEditing(true); 
                    setShouldSkipCityInputs(false); 
                    setWarning("⚠️ RTDB index mila, par family data Firestore mein nahi mila. Naya family banao.");
                }
            } else {
                setIsEditing(true); // No family found -> set to Create Mode
                setShouldSkipCityInputs(false); 
                setWarning("⚠️ No family found. Create a new one or Join (SRNO).");
            }
        } catch (err) {
            console.error("RTDB/Firestore fetch error:", err);
            setWarning("⚠️ Data fetch error. Check console.");
        }
      } else {
        setIsEditing(false);
        setWarning("⚠️ Log in to create or join a family.");
      }
      setLoading(false);

    };

    if (!user) {
        setWarning("⚠️ Log in to create or join a family.");
        setLoading(false);
    } else {
        fetchFamilyProfile();
    }
  }, [profile, user, updateProfile]);
  
  // 🛑 enterEditMode function (Fixed ReferenceError)
  const enterEditMode = async () => {
    if (isUserPending) {
      setWarning("❌ તમે મંજૂરી બાકી હોવાને કારણે એડિટ કરી શકતા નથી.");
      return;
    }

    setLoading(true);
    setWarning("");
    setShouldSkipCityInputs(false); // Ensure city inputs show if we manually enter edit mode

    try {
        if (profile?.id) {
            const familyDocRef = doc(datastore, "families", profile.id);
            const familyDocSnap = await getDoc(familyDocRef);

            if (familyDocSnap.exists()) {
                const familyData = { id: familyDocSnap.id, ...familyDocSnap.data() };
                
                await updateProfile(familyData); 
                setMembers(familyData.members || []);
                
                setFormData(s => ({ 
                    ...s, 
                    nativeCity: familyData.nativeCity || "",
                    currentCity: familyData.currentCity || "",
                }));
                
                setIsEditing(true);
                setWarning("✅ Data Refreshed. You are now in EDIT mode.");
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


  const showLocalForageDataModal = async () => {
    // ... (modal logic remains the same) ...
    try {
      const localForageKey = `profileData_${user.uid}`;
      const allData = await localforage.getItem(localForageKey);
      const content = JSON.stringify(allData, null, 2);
      
      setLocalForageDataModalContent(content); 
      setShowDataModal(true); 
      
    } catch (err) {
      console.error("Error retrieving all LocalForage data:", err);
      setLocalForageDataModalContent(`Error retrieving data: ${err.message}`);
      setShowDataModal(true);
    }
  };
  

  // ✅ handleAdd/handleMemberSave (MemberForm se call hoga)
  const handleAdd = () => {
    
    // 1. City Check (Only for New Family Creation)
    const isNewFamilyCreation = !profile?.id && !isJoinMode && !shouldSkipCityInputs;

    if (isNewFamilyCreation && (!formData.nativeCity.trim() || !formData.currentCity.trim())) {
        setWarning("⚠️ કૃપા કરીને પહેલા વતન અને હાલનું શહેર ભરો.");
        return;
    }
    
    // 2. Member Field Check (Uses the relaxed canAdd for linking mode)
    if (!canAdd) {
      if (isLinkingMode) {
          setWarning("⚠️ કૃપા કરીને તમારો મોબાઇલ નંબર દાખલ કરો.");
      } else {
          setWarning("⚠️ કૃપા કરીને સભ્યની તમામ વિગતો ભરો.");
      }
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
      // 3. New Member/Linking Logic
      
      const newMemberData = {
          id: crypto.randomUUID(),
          userId: user.uid,
          // Default values for linking mode if name/gender were not required and not provided
          gender: formData.gender || (isLinkingMode ? "M/F" : ""), 
          name: formData.name.trim() || (isLinkingMode ? "Linking User" : ""), 
          countryCode: formData.countryCode,
          mobile: formData.mobile,
          pending: isLinkingMode ? true : false, // Linking members are pending
      };
      
      // In linking mode, we primarily look to update an existing placeholder member (if any)
      const existingMemberIndex = members.findIndex(m => 
          m.countryCode === newMemberData.countryCode && m.mobile === newMemberData.mobile
      );
      
      if (isLinkingMode && existingMemberIndex !== -1) {
          // Found member by mobile number in a linking flow (e.g., from RTDB sync)
          setMembers((prev) => 
              prev.map((m, index) => 
                  index === existingMemberIndex 
                      ? { 
                          ...m, 
                          userId: user.uid, 
                          pending: true, 
                          name: newMemberData.name !== "Linking User" ? newMemberData.name : m.name, // Only update name if user entered one
                          gender: newMemberData.gender !== "M/F" ? newMemberData.gender : m.gender, // Only update gender if user selected one
                        }
                      : m
              )
          );
      } else {
          // Add as a brand new member
          setMembers((prev) => [
              ...prev,
              newMemberData, 
          ]);
      }
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
      }
  };
  
  // 🚀 LOGIC: Toggle Pending Status (Approve/Reject)
  const toggleMemberPendingStatus = async (memberId, currentPendingStatus) => {
    if (!profile?.id || !isUserNonPendingEditor) {
        setWarning("⚠️ તમને આ સભ્યની સ્થિતિ બદલવાની પરવાનગી નથી.");
        return;
    }
    
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


  // ✅ handleFinish (Family Data Save Karo button se call hoga)
  const handleFinish = async () => {
    if (isUserPending) {
      setWarning("❌ મંજૂરી બાકી હોવાને કારણે તમે ડેટા સેવ કરી શકતા નથી.");
      setLoading(false);
      return;
    }
    
    setLoading(true);

    let finalMembersToSave = [...members]; 
    const isJoining = joinSrno.trim() && !profile?.id;

    // 1. FINAL CHECK: Agar form mein unsaved member data hai, toh use pehle list mein add karo.
    if (canAdd && !editingId) {
        const isLinking = isLinkingMode;
        
        const newMemberData = {
          id: crypto.randomUUID(),
          userId: user.uid,
          gender: formData.gender || (isLinking ? "M/F" : ""), 
          name: formData.name.trim() || (isLinking ? "Linking User" : ""), 
          countryCode: formData.countryCode,
          mobile: formData.mobile,
          pending: isLinking ? true : false, 
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

    if (finalMembersToSave.length === 0 && !isJoining) {
      setWarning("⚠️ ઓછામાં ઓછો એક સભ્ય ઉમેરો અથવા SRNO દાખલ કરો.");
      setLoading(false);
      return;
    }

    const masterIndexRef = ref(db, 'master/familyIndex');
    const userIndexRef = ref(db, `users/${user.uid}/familySrno`);
    const familiesRef = collection(datastore, "families");
    let successMessage = "";

    try {
        let finalFamilyPayload = {};
        let familyIdToSave = profile?.id;

        // 🤝 JOIN FAMILY LOGIC 
        if (isJoining || shouldSkipCityInputs) {
            const srnoToJoin = joinSrno.trim();
            const existingFamilyRef = doc(familiesRef, srnoToJoin);
            const existingFamilyDoc = await getDoc(existingFamilyRef);

            if (existingFamilyDoc.exists()) {
                const existingFamilyData = existingFamilyDoc.data();
                familyIdToSave = existingFamilyDoc.id; 
                
                const currentUserData = finalMembersToSave.find(m => m.userId === user.uid) || finalMembersToSave[0];
                if (!currentUserData) throw new Error("Current user data missing from members list.");
                
                let updatedMembers = existingFamilyData.members;

                // 1. Find and update existing member by mobile number
                const existingIndex = updatedMembers.findIndex(m => 
                    m.mobile === currentUserData.mobile && m.countryCode === currentUserData.countryCode
                );

                if (existingIndex !== -1) {
                    updatedMembers[existingIndex] = { 
                        ...updatedMembers[existingIndex], 
                        userId: user.uid,
                        pending: true, // Always pending on join/link
                    };
                } else {
                    // 2. Add the user as a new pending member
                    updatedMembers.push({ 
                        ...currentUserData, 
                        userId: user.uid,
                        pending: true, 
                    });
                }
                finalMembersToSave = updatedMembers;

                finalFamilyPayload = {
                    ...existingFamilyData,
                    members: finalMembersToSave,
                    updatedAt: serverTimestamp(),
                };
                
                await updateDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); 
                await set(userIndexRef, familyIdToSave); 
                successMessage = `✅ Family ${familyIdToSave} joined! Your request is pending approval.`;

            } else {
                setWarning(`⚠️ Invalid Family ID (SRNO): ${srnoToJoin}. Family not found in Firestore.`);
                setLoading(false);
                return;
            }
        } 
        // 🆕 CREATE or 🔄 UPDATE LOGIC
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
                const pin = Math.floor(1000 + Math.random() * 9000).toString(); 

                finalFamilyPayload = {
                    nativeCity: formData.nativeCity,
                    currentCity: formData.currentCity,
                    members: finalMembersToSave.map(m => ({ ...m, pending: false })), // Creator is not pending
                    pin, 
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                };
                
                await setDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); 
                await set(userIndexRef, familyIdToSave); 
                successMessage = `✅ New Family created! ID (SRNO): ${familyIdToSave}`;

            } else {
                // 🔄 UPDATE Existing family
                familyIdToSave = profile.id;
                
                finalFamilyPayload = {
                    nativeCity: formData.nativeCity,
                    currentCity: formData.currentCity,
                    members: finalMembersToSave,
                    updatedAt: serverTimestamp(),
                };
                
                await updateDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); 
                successMessage = `✅ Family ${familyIdToSave} updated successfully!`;
            }
        }

        // 5. Local State Update (Saves to localforage)
        const localDataToSave = {
            ...finalFamilyPayload,
            id: familyIdToSave, 
            pin: finalFamilyPayload.pin || profile?.pin || joinSrno, 
            updatedAt: Date.now(), 
            createdAt: finalFamilyPayload.createdAt || profile?.createdAt
        };
        
        await updateProfile(localDataToSave); 
        setMembers(finalMembersToSave); 
        setIsEditing(isJoining || shouldSkipCityInputs ? true : false); // Stay in form if pending/linking, else switch to view.
        setShouldSkipCityInputs(false); 
        
        if (successMessage) {
            alert(successMessage);
        }
        
        await showLocalForageDataModal(); 
        
    } catch (err) {
        setWarning(`⚠️ Save failed.`);
        console.error("RTDB/Firestore error:", err);
        alert(`⚠️ Save failed. ${err.message || ''}`);
    } finally {
        setLoading(false);
    }
  };


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
    <div className="p-3">
      
      {/* 1. VIEW MODE DISPLAY */}
      {user && isViewMode && (
          <FamilySummaryView 
              profile={profile} 
              members={members} 
              enterEditMode={enterEditMode} 
              loading={loading}
              isUserNonPendingEditor={isUserNonPendingEditor}
              isUserPending={isUserPending} 
          />
      )}

      {/* 2. EDIT/CREATE/JOIN MODE */}
      {/* 🛑 RESTRICTION: Block the entire editing UI if the user is pending and NOT in linking mode (they were already linked) */}
      {user && !isViewMode && !(isUserPending && !isLinkingMode) && (
        <>
          {/* City Inputs - 🛑 CONDITIONALLY RENDER */}
          {/* Only show CityInputs if we are NOT in the special skip mode */}
          {!shouldSkipCityInputs && (
              <CityInputs
                formData={formData}
                setFormData={setFormData}
                joinSrno={joinSrno} 
                setJoinSrno={setJoinSrno} 
                profile={profile}
              />
          )}
          
          {/* 🛑 NEW: Cancel Edit Button */}
          {profile?.id && isEditing && !isLinkingMode && (
              <div className="flex justify-end mt-4">
                  <button 
                      onClick={handleCancelEdit} 
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-semibold"
                  >
                      ❌ Cancel Edit & View Summary
                  </button>
              </div>
          )}
          
          {/* Member List */}
          {(profile?.id || members.length > 0) && (
              <MemberList
                members={members}
                startEditMember={startEditMember}
                deleteMember={deleteMember}
                toggleMemberPendingStatus={toggleMemberPendingStatus} 
                isUserNonPendingEditor={isUserNonPendingEditor}
                isEditMode={!isViewMode} 
              />
          )}

          {/* MemberForm */}
          {/* Show MemberForm if we are creating, updating, or in linking mode */}
          {user && (profile?.id || isReadyForMembers || isLinkingMode) && ( 
              <MemberForm
                formData={formData}
                setFormData={setFormData}
                handleMemberSave={handleAdd}
                handleCancelEdit={handleCancelEdit}
                editingId={editingId}
              />
          )}
          
          {/* Family Save Button (This calls handleFinish) */}
          {canSaveFamily && (
            <button
              onClick={handleFinish}
              className={`w-full text-white px-4 py-2 mt-4 rounded-lg font-bold shadow-lg 
                ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`
              }
              disabled={loading}
            >
              {loading 
                ? "સેવ થઈ રહ્યું છે..." 
                : profile?.id 
                ? "ફેરફારો સેવ કરો (Family Update)" 
                : "ડેટા સેવ કરો (Family Create)"
              }
            </button>
          )}

        </>
      )}

      {/* 🛑 NEW: Pending User Message (Full Block) */}
      {user && !isViewMode && isUserPending && !isLinkingMode && (
          <p className="text-center p-4 mt-4 text-lg font-bold text-red-700 bg-red-100 border border-red-400 rounded-lg shadow-md">
              ❌ તમારી ફેમિલી મેમ્બરશિપ હજુ મંજૂર થઈ નથી. તમે ડેટા એડિટ કરી શકતા નથી.
          </p>
      )}

      {/* 3. Warning / Messages */} 
      {warning && <p className="text-red-500 mt-2">{warning}</p>}

      {/* 4. Modal */}
      <LocalForageDataModal
        show={showDataModal}
        content={localForageDataModalContent}
        onClose={() => setShowDataModal(false)}
        userUid={user?.uid}
      />
    </div>
  );
};

export default CombinedForm;