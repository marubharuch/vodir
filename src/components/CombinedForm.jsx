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

// 📌 MemberForm definition (Only used for Create/Update mode now)
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

// 🆕 NEW COMPONENT: Phone inputs for Join Mode
const JoinPhoneInput = ({ formData, setFormData }) => (
    <div className="mt-3 p-4 border rounded-lg bg-blue-50">
        <h2 className="text-lg font-bold text-blue-700">📞 તમારો મોબાઇલ નંબર</h2>
        <p className="text-sm text-gray-600 mb-3">ફેમિલીમાં જોડાવા માટે, કૃપા કરીને તમારો મોબાઇલ નંબર દાખલ કરો.</p>
        
        <div className="flex gap-2 my-2 w-full max-w-full">
            <input
            type="text"
            value={formData.countryCode}
            onChange={(e) =>
                setFormData({ ...formData, countryCode: e.target.value })
            }
            className="border p-2 w-16 flex-shrink-0"
            />
            <input
            type="text"
            placeholder="મોબાઇલ નંબર"
            value={formData.mobile}
            onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
            }
            className="border p-2 flex-1 min-w-0 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
        <input
            type="text"
            placeholder="નામ (Optional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 w-full my-2"
        />
    </div>
);


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
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 📌 Derived State for simplified logic
  const isJoinMode = joinSrno.trim().length > 0 && !profile?.id;


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
        setIsEditing(true);
        setWarning("✅ તમારો ફેમિલી ડેટા લોડ થઈ ગયો છે!");
        setLoading(false);
        return;
      }

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
                    setIsEditing(true);
                    setWarning(`✅ Family ${familyDocSnap.id} synced via RTDB index.`);
                } else {
                    setIsEditing(true); 
                    setWarning("⚠️ RTDB index mila, par family data Firestore mein nahi mila. Naya family banao.");
                }
            } else {
                setIsEditing(true);
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

  // 🎯 CRITICAL CHANGE: Validation for all modes
  const isPhoneValidForJoin = formData.countryCode.startsWith("+") && formData.mobile.trim();
  
  // Validation for adding a member in CREATE/UPDATE mode
  const canAddMember = formData.gender && formData.name.trim() && isPhoneValidForJoin;


  // ✅ handleAdd/handleMemberSave (Only used in CREATE/UPDATE mode)
  const handleAdd = () => {
    if (!isJoinMode && (!formData.nativeCity.trim() || !formData.currentCity.trim())) {
      setWarning("⚠️ કૃપા કરીને પહેલા વતન અને હાલનું શહેર ભરો.");
      return;
    }
    if (!canAddMember) {
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
          pending: false, 
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

  // 🆕 New function to handle member edit cancellation (Only used in CREATE/UPDATE mode)
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
  };

  // ✅ handleFinish (Family Data Save Karo button se call hoga)
  const handleFinish = async () => {
    console.log("--- HANDLE FINISH START (Family Save) ---");
    setLoading(true);

    let finalMembersToSave = [...members]; 

    // 1. FINAL CHECK for CREATE/UPDATE flow (must have members or one unsaved member)
    if (!isJoinMode && canAddMember && !editingId) {
        // Add the last member from the form data to the payload
        finalMembersToSave.push({
            id: crypto.randomUUID(),
            userId: user.uid,
            gender: formData.gender, 
            name: formData.name.trim(), 
            countryCode: formData.countryCode,
            mobile: formData.mobile,
            pending: false,
        });
        setFormData((s) => ({...s, gender: "", name: "", countryCode: "+91", mobile: ""}));
    }

    // 2. Early Exit Check
    if (isJoinMode && !isPhoneValidForJoin) {
         setWarning("⚠️ જોડાવા માટે SRNO અને તમારો મોબાઇલ નંબર જરૂરી છે.");
         setLoading(false);
         return;
    }
    if (!isJoinMode && finalMembersToSave.length === 0) {
      setWarning("⚠️ ઓછામાં ઓછો એક સભ્ય ઉમેરો.");
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

        // 🤝 JOIN FAMILY LOGIC (Simplified: uses formData directly)
        if (isJoinMode) {
            console.log("FLOW: Entering JOIN Family Logic. SRNO:", joinSrno);
            const srnoToJoin = joinSrno.trim();
            const existingFamilyRef = doc(familiesRef, srnoToJoin);
            const existingFamilyDoc = await getDoc(existingFamilyRef);

            if (existingFamilyDoc.exists()) {
                const existingFamilyData = existingFamilyDoc.data();
                familyIdToSave = existingFamilyDoc.id; 
                
                // Get the user's details directly from the form state (formData)
                const currentUserData = {
                    id: crypto.randomUUID(),
                    userId: user.uid,
                    gender: formData.gender || 'Unknown', 
                    name: formData.name.trim() || 'Pending User', 
                    countryCode: formData.countryCode,
                    mobile: formData.mobile,
                };

                const { mobile, countryCode, name, gender } = currentUserData;
                let matchFound = false;

                let updatedMembers = existingFamilyData.members.map(m => {
                    // 📌 MATCHING LOGIC: Match by phone number
                    if (m.mobile === mobile && m.countryCode === countryCode) {
                        matchFound = true;
                        console.log("JOIN: Matched existing member by phone number. Linking UID.");
                        return { 
                            ...m, 
                            userId: user.uid, 
                            name: m.name || name || 'Pending User', // Update name if empty
                            gender: m.gender || gender || 'Unknown', // Update gender if empty
                            pending: true, // Mark as pending admin approval
                        }; 
                    }
                    return m;
                });
                
                // If no phone match was found, add the user as a new, pending member
                if (!matchFound) {
                     console.log("JOIN: Phone number not found. Adding as a new pending member.");
                     updatedMembers.push({ 
                        ...currentUserData,
                        pending: true, // Mark as pending admin approval
                     });
                }

                finalFamilyPayload = {
                    ...existingFamilyData,
                    members: updatedMembers,
                    updatedAt: serverTimestamp(),
                };
                
                await updateDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); // 👈 FIREBASE WRITE
                await set(userIndexRef, familyIdToSave); // 👈 RTDB WRITE (Index)
                successMessage = `✅ Family ${familyIdToSave} join request sent and synced! (Pending)`;
                
                // Update local state with the newly joined data
                finalMembersToSave = updatedMembers;


            } else {
                setWarning(`⚠️ Invalid Family ID (SRNO): ${srnoToJoin}. Family not found in Firestore.`);
                setLoading(false);
                return;
            }
        } 
        // 🆕 CREATE or 🔄 UPDATE LOGIC (Remains the same, using finalMembersToSave)
        else {
            if (!profile?.id) {
                // ... CREATE logic using finalMembersToSave ...
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
                    members: finalMembersToSave.map(m => ({ ...m, pending: false })),
                    pin, 
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                };
                
                await setDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); 
                
                try {
                    await set(userIndexRef, familyIdToSave); 
                    successMessage = `✅ New Family created! ID (SRNO): ${familyIdToSave}. Index synced.`;
                } catch (rtdbErr) {
                    throw new Error(`RTDB Indexing failed. Family ID is: ${familyIdToSave}. Error: ${rtdbErr.message}`);
                }


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
        
        await updateProfile(localDataToSave); 
        setMembers(finalMembersToSave); 
        setIsEditing(true);
        
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
    // ... (Code remains the same)
  };

  const deleteMember = (id) => {
    // ... (Code remains the same)
  };

  const isReadyForMembers = 
    profile?.id || 
    (joinSrno.trim().length > 0) || 
    (formData.nativeCity.trim().length > 0 && formData.currentCity.trim().length > 0); 
    
  // 📌 Final save check relies on the new simplified logic for join mode
  const canSaveFamily = isJoinMode 
    ? isPhoneValidForJoin 
    : (isReadyForMembers && (members.length > 0 || canAddMember)); // Use canAddMember for create/update


  return (
    <div className="p-3">
      {/* 1. Sync button */}
      {/* ... (Code remains the same) */}

      {/* 2. City Inputs */}
      {user && (!profile?.id || isEditing) && (
          <CityInputs
            formData={formData}
            setFormData={setFormData}
            joinSrno={joinSrno} 
            setJoinSrno={setJoinSrno} 
            profile={profile}
          />
      )}
      
      {/* 3. Join Mode Phone Input */}
      {user && isJoinMode && (
          <JoinPhoneInput formData={formData} setFormData={setFormData} />
      )}

      {/* 4. Member List: Only show if NOT in Join Mode */}
      {user && !isJoinMode && (profile?.id || members.length > 0) && (
          <MemberList
            members={members}
            startEditMember={startEditMember}
            deleteMember={deleteMember}
          />
      )}

      {/* 5. MemberForm: Only show if NOT in Join Mode (i.e., for Create/Update) */}
      {user && !isJoinMode && (profile?.id || isReadyForMembers) && (
          <MemberForm
            formData={formData}
            setFormData={setFormData}
            handleMemberSave={handleAdd} 
            handleCancelEdit={handleCancelEdit} 
            editingId={editingId}
          />
      )}
      
      {/* 6. Family Save Button (This calls handleFinish) */}
      {user && canSaveFamily && (
        <button
          onClick={handleFinish}
          className={`w-full text-white px-4 py-2 mt-4 rounded-lg font-bold shadow-lg 
            ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`
          }
          disabled={loading}
        >
          {loading 
            ? "સેવ થઈ રહ્યું છે..." 
            : isJoinMode 
            ? "ફેમિલી સાથે જોડાઓ (Join Family)"
            : profile?.id 
            ? "ફેરફારો સેવ કરો (Family Update)" 
            : "ડેટા સેવ કરો (Family Create)"
          }
        </button>
      )}

      {/* 7. Fallback Message */}
      {user && !loading && !profile?.id && !isReadyForMembers && (
        <p className="text-gray-600 mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
          🔑 કૃપા કરીને પહેલા વતન, હાલનું શહેર ભરો અથવા ફેમિલી SRNO દાખલ કરો.
        </p>
      )}

      {/* 8. Warning / Messages */}
      {warning && <p className="text-red-500 mt-2">{warning}</p>}

      {/* 9. Modal */}
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