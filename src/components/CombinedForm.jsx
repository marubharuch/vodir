import React, { useState, useEffect } from "react";
import { useProfile } from "../context/ProfileContext";
// ✅ FIRESTORE IMPORTS
import { datastore } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
// ✅ RTDB IMPORTS (New Imports for Indexing)
import { db } from "../firebase"; 
import { ref, runTransaction, get, set } from "firebase/database"; 
import { useAuth } from "../context/AuthContext";
import localforage from "localforage";

import CityInputs from "./CityInputs";
import MemberList from "./MemberList";

// 🆕 NEW COMPONENT: LocalForageDataModal (Utility)
const LocalForageDataModal = ({ show, content, onClose, userUid }) => {
  if (!show) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        zIndex: 1000 
      }}
    >
      <div 
        style={{
          backgroundColor: 'white', padding: '20px', borderRadius: '8px', 
          maxWidth: '90%', maxHeight: '80%', overflowY: 'auto', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
        }}
      >
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          LocalForage Data for User: {userUid}
        </h3>
        <p>This is the current state of the local family data on this device:</p>
        <pre 
          style={{ 
            whiteSpace: 'pre-wrap', 
            wordWrap: 'break-word', 
            background: '#f4f4f4', 
            padding: '10px', 
            borderRadius: '4px', 
            fontSize: '12px' 
          }}
        >
          {content}
        </pre>
        <button 
          onClick={onClose} 
          style={{ 
            marginTop: '15px', padding: '8px 15px', 
            backgroundColor: '#007bff', color: 'white', border: 'none', 
            borderRadius: '4px', cursor: 'pointer' 
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

// 📌 MemberForm definition (Single Member Actions)
const MemberForm = ({
  formData,
  setFormData,
  handleMemberSave, 
  handleCancelEdit,
  editingId,
}) => {
  return (
    <div className="mt-3 border p-3 rounded">
      <h2 className="text-lg font-bold">📝 સભ્યની વિગતો</h2>
      <div className="flex gap-2 my-2 w-full max-w-full">
        <select
          value={formData.gender}
          onChange={(e) =>
            setFormData({ ...formData, gender: e.target.value })
          }
          className="border p-1 w-1/5"
        >
          <option value="">M/F</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input
          type="text"
          value={formData.countryCode}
          onChange={(e) =>
            setFormData({ ...formData, countryCode: e.target.value })
          }
          className="border p-1 w-16 flex-shrink-0"
        />
        <input
          type="text"
          placeholder="મોબાઇલ"
          value={formData.mobile}
          onChange={(e) =>
            setFormData({ ...formData, mobile: e.target.value })
          }
          className="border p-1 flex-1 min-w-0"
        />
      </div>
      <input
        type="text"
        placeholder="નામ"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="border p-1 w-full my-2"
      />
      <div className="flex gap-2">
        <button
          onClick={handleMemberSave} 
          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
        >
          {editingId ? "અપડેટ કરો" : "સેવ કરો"}
        </button>
        <button
          onClick={handleCancelEdit} 
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
        >
          રદ કરો
        </button>
      </div>
    </div>
  );
};

// 🆕 NEW COMPONENT: FamilySummaryView (View Mode for Registered Users)
const FamilySummaryView = ({ profile, members, enterEditMode, loading, isUserNonPendingEditor }) => {
    if (!profile || !profile.id) return null;

    // Determine Family Creator Name
    const creator = members.find(m => m.userId === profile.createdBy)?.name || 'N/A';
    
    // Check if the current user is linked to any member
    const canModify = isUserNonPendingEditor;

    return (
        <div className="p-4 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">🏠 ફેમિલી સારાંશ (Family Summary)</h2>
            
            {/* --- Family Details --- */}
            <div className="mb-4 space-y-2 text-gray-700 border-b pb-4">
                <p className="font-mono text-sm">
                    <strong>SRNO/Family ID:</strong> <span className="text-xl font-extrabold text-red-600">{profile.id}</span>
                </p>
                <p><strong>વતન (Native City):</strong> {profile.nativeCity || 'N/A'}</p>
                <p><strong>હાલનું શહેર (Current City):</strong> {profile.currentCity || 'N/A'}</p>
                <p><strong>બનાવનાર (Creator):</strong> {creator}</p>
            </div>

            {/* --- Member List (View Only) --- */}
            <h3 className="text-xl font-bold mt-4 mb-3 text-indigo-700">👥 સભ્યો</h3>
            
            {members.map((member) => (
                <div 
                    key={member.id} 
                    className={`flex justify-between items-center p-3 my-2 rounded-md shadow-sm border 
                        ${member.pending ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-50 border-gray-200'}`
                    }
                >
                    <span className="text-gray-800">
                        {member.gender}: <strong>{member.name}</strong> ({member.countryCode} {member.mobile})
                        {member.pending && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                                ⏳ Pending
                            </span>
                        )}
                    </span>
                </div>
            ))}
            
            {/* --- Modify Button (Action: enterEditMode) --- */}
            {canModify && (
                <button
                    onClick={enterEditMode}
                    className={`w-full text-white px-4 py-2 mt-4 rounded-lg font-bold shadow-md transition duration-150 
                        ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`
                    }
                    disabled={loading}
                >
                    {loading ? "Data Fetching..." : "✏️ Modify Family Data"}
                </button>
            )}
            
        </div>
    );
};


const CombinedForm = () => {
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();
  if(user) console.log("Current User UID:", user.uid);

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

  // 📌 Derived States
  const isJoinMode = joinSrno.trim().length > 0 && !profile?.id;
  const isViewMode = profile?.id && !isEditing && !isJoinMode; 
  const isUserNonPendingEditor = profile?.id && members.some(
      m => m.userId === user?.uid && m.pending !== true
  );

  // ✅ HYBRID FETCH: On mount / profile change => Family fetch karo 
  useEffect(() => {
    const fetchFamilyProfile = async () => {
      setLoading(true);

      if (profile?.id) {
        setFormData((s) => ({
          ...s,
          nativeCity: profile.nativeCity || "",
          currentCity: profile.currentCity || "",
        }));
        setMembers(profile.members || []);
        // Start in View Mode if a profile exists
        setIsEditing(false); 
        setWarning("✅ તમારો ફેમિલી ડેટા લોડ થઈ ગયો છે!");
        setLoading(false);
        return;
      }
      
      // ... (Rest of the fetch logic remains the same, but ensures setIsEditing(true) for Create mode) ...
      
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
                    setMembers(familyData.members || []);
                    setIsEditing(false); // Found family -> set to View Mode (isEditing: false)
                    setWarning(`✅ Family ${familyDocSnap.id} synced via RTDB index.`);
                } else {
                    setIsEditing(true); 
                    setWarning("⚠️ RTDB index mila, par family data Firestore mein nahi mila. Naya family banao.");
                }
            } else {
                setIsEditing(true); // No family found -> set to Create Mode (isEditing: true)
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

  const showLocalForageDataModal = async () => {
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
  
  // 🆕 NEW FUNCTION: Enter Edit Mode (Used by FamilySummaryView)
  const enterEditMode = async () => {
      setLoading(true);
      setWarning("");

      try {
          // Force a refresh from Firestore to ensure the user is editing the latest data
          if (profile?.id) {
              const familyDocRef = doc(datastore, "families", profile.id);
              const familyDocSnap = await getDoc(familyDocRef);

              if (familyDocSnap.exists()) {
                  const familyData = { id: familyDocSnap.id, ...familyDocSnap.data() };
                  
                  // Update local state and localforage with fresh data
                  await updateProfile(familyData); 
                  setMembers(familyData.members || []);
                  
                  // Load family data into form for editing cities
                  setFormData(s => ({ 
                      ...s, 
                      nativeCity: familyData.nativeCity || "",
                      currentCity: familyData.currentCity || "",
                  }));
                  
                  // 🚀 Switch to Edit Mode
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

  const canAdd =
    formData.gender &&
    formData.name.trim() &&
    formData.countryCode.startsWith("+") &&
    formData.mobile.trim();

  // ✅ handleAdd/handleMemberSave (MemberForm se call hoga)
  const handleAdd = () => {
    if (!formData.nativeCity.trim() || !formData.currentCity.trim()) {
      setWarning("⚠️ કૃપા કરીને પહેલા વતન અને હાલનું શહેર ભરો.");
      return;
    }
    if (!canAdd) {
      setWarning("⚠️ કૃપા કરીને સભ્યની તમામ વિગતો ભરો.");
      return;
    }
    setWarning("");
    console.log("MEMBER ACTION: Adding/Updating a single member.");

    if (editingId) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, ...formData, name: formData.name.trim() }
            : m
        )
      );
      setEditingId(null);
    } else {
      setMembers((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          userId: user.uid,
          gender: formData.gender,
          name: formData.name.trim(),
          countryCode: formData.countryCode,
          mobile: formData.mobile,
          pending: false, // New members added through the form are non-pending
        },
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
      // 🚀 CRITICAL FIX: Switch back to View Mode if a profile exists (as requested)
      if (profile?.id) {
          setIsEditing(false);
      }
      console.log("MEMBER ACTION: Edit cancelled/Form cleared.");
  };
  
  // 🚀 NEW LOGIC: Toggle Pending Status (Approve/Reject)
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

        const finalFamilyPayload = {
            ...profile,
            members: updatedMembers,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(doc(familiesRef, familyIdToSave), { 
            members: finalFamilyPayload.members,
            updatedAt: finalFamilyPayload.updatedAt,
        });

        const localDataToSave = {
            ...finalFamilyPayload,
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
    console.log("--- HANDLE FINISH START (Family Save) ---");
    setLoading(true);

    let finalMembersToSave = [...members]; 

    // 1. FINAL CHECK: Agar form mein unsaved member data hai, toh use pehle list mein add karo.
    if (canAdd && !editingId) {
        console.log("LOGIC: Unsaved member data found. Adding synchronously to payload.");
        finalMembersToSave.push({
          id: crypto.randomUUID(),
          userId: user.uid,
          gender: formData.gender,
          name: formData.name.trim(),
          countryCode: formData.countryCode,
          mobile: formData.mobile,
          pending: false,
        });
        // Clear the form fields since data is now in payload
        setFormData((s) => ({
            ...s,
            gender: "",
            name: "",
            countryCode: "+91",
            mobile: "",
        }));
    }

    // 2. Early Exit Check (using the final list)
    if (finalMembersToSave.length === 0 && !joinSrno.trim()) {
      setWarning("⚠️ ઓછામાં ઓછો એક સભ્ય ઉમેરો અથવા SRNO દાખલ કરો.");
      setLoading(false);
      console.log("EXIT: No members and no SRNO. Returning early.");
      return;
    }

    const masterIndexRef = ref(db, 'master/familyIndex');
    const userIndexRef = ref(db, `users/${user.uid}/familySrno`);
    const familiesRef = collection(datastore, "families");
    let successMessage = "";

    try {
        let finalFamilyPayload = {};
        let familyIdToSave = profile?.id;
        const isJoining = joinSrno.trim() && !profile?.id;

        // 🤝 JOIN FAMILY LOGIC (Firestore/RTDB Index Update)
        if (isJoining) {
            console.log("FLOW: Entering JOIN Family Logic. SRNO:", joinSrno);
            const srnoToJoin = joinSrno.trim();
            const existingFamilyRef = doc(familiesRef, srnoToJoin);
            const existingFamilyDoc = await getDoc(existingFamilyRef);

            if (existingFamilyDoc.exists()) {
                const existingFamilyData = existingFamilyDoc.data();
                familyIdToSave = existingFamilyDoc.id; 
                
                const currentUserData = finalMembersToSave.find(m => m.userId === user.uid) || finalMembersToSave[0];
                if (!currentUserData) throw new Error("Current user data missing from members list.");

                let matchFound = false;
                let updatedMembers = existingFamilyData.members.map(m => {
                    if (m.mobile === currentUserData.mobile && m.countryCode === currentUserData.countryCode) {
                        matchFound = true;
                        return { 
                            ...m, 
                            userId: user.uid,
                            pending: true, // Joining members are always pending initially
                        }; 
                    }
                    return m;
                });
                
                if (!matchFound) {
                     updatedMembers.push({ 
                        ...currentUserData, 
                        userId: user.uid,
                        pending: true, // Joining members are always pending initially
                     });
                } else {
                    finalMembersToSave = updatedMembers;
                }

                finalFamilyPayload = {
                    ...existingFamilyData,
                    members: finalMembersToSave,
                    updatedAt: serverTimestamp(),
                };
                
                await updateDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); // 👈 FIREBASE WRITE
                await set(userIndexRef, familyIdToSave); // 👈 RTDB WRITE (Index)
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
                // --- RTDB TRANSACTION for SRNO (NEW FAMILY CREATION) ---
                console.log("FLOW: Entering CREATE New Family Logic.");
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
                    members: finalMembersToSave.map(m => ({ ...m, pending: false })), // Creators are non-pending
                    pin, 
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                };
                
                await setDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); // 👈 FIREBASE WRITE
                await set(userIndexRef, familyIdToSave); // 👈 RTDB WRITE (Index)
                successMessage = `✅ New Family created! ID (SRNO): ${familyIdToSave}`;

            } else {
                // 🔄 UPDATE Existing family
                console.log("FLOW: Entering UPDATE Existing Family Logic. ID:", profile.id);
                familyIdToSave = profile.id;
                
                finalFamilyPayload = {
                    nativeCity: formData.nativeCity,
                    currentCity: formData.currentCity,
                    members: finalMembersToSave,
                    updatedAt: serverTimestamp(),
                };
                
                await updateDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); // 👈 FIREBASE WRITE
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
        
        await updateProfile(localDataToSave); // Saves to state and localforage
        setMembers(finalMembersToSave); // Sync members state
        setIsEditing(false); // Switch back to View Mode after successful save
        
        if (successMessage) {
            alert(successMessage);
        }
        
        await showLocalForageDataModal(); 
        
    } catch (err) {
        setWarning(`⚠️ Save failed.`);
        console.error("RTDB/Firestore error:", err);
        alert(`⚠️ Save failed. ${err.message || ''}`);
    } finally {
        console.log("--- HANDLE FINISH END | Loading Set to false ---");
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
              enterEditMode={enterEditMode} // Allows switching to edit mode
              loading={loading}
              isUserNonPendingEditor={isUserNonPendingEditor}
          />
      )}

      {/* 2. EDIT/CREATE/JOIN MODE */}
      {user && !isViewMode && (
        <>
          {/* City Inputs */}
          <CityInputs
            formData={formData}
            setFormData={setFormData}
            joinSrno={joinSrno} 
            setJoinSrno={setJoinSrno} 
            profile={profile}
          />
          
          {/* 🛑 NEW: Cancel Edit Button (Appears when in Edit Mode for an existing family) */}
          {profile?.id && isEditing && (
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
                // Only allow editing/deleting members in Edit/Create mode (not View mode)
                isEditMode={!isViewMode} 
              />
          )}

          {/* MemberForm */}
          {(profile?.id || isReadyForMembers) && !isJoinMode && (
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

          {/* 🛑 REMOVED: The Fallback Message was removed as requested. */}
        </>
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