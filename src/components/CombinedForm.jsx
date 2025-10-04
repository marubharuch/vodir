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
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ HYBRID FETCH: On mount / profile change => Family fetch karo 
  useEffect(() => {
    const fetchFamilyProfile = async () => {
      setLoading(true);

      // 1. Local Data Found: Load from profile context (Zero cost)
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

      // 2. New Device/No Local Data: Check RTDB Index for Family SRNO
      if (user) {
        try {
            // 🚀 RTDB LOOKUP: User ke UID se Family SRNO find karein (Minimal cost)
            const srnoRef = ref(db, `users/${user.uid}/familySrno`);
            const srnoSnapshot = await get(srnoRef);
            const familySrno = srnoSnapshot.val();
            console.log(`FETCH: RTDB lookup for ${user.uid} returned SRNO:`, familySrno);

            if (familySrno) {
                // 🎉 Data found in RTDB Index! Ab seedha Firestore se fetch karo (Single read cost)
                const familyDocRef = doc(datastore, "families", familySrno.toString());
                const familyDocSnap = await getDoc(familyDocRef);

                if (familyDocSnap.exists()) {
                    const familyData = { id: familyDocSnap.id, ...familyDocSnap.data() };
                    
                    // Update profile automatically saves to localforage
                    await updateProfile(familyData); 
                    setMembers(familyData.members || []);
                    setIsEditing(true);
                    setWarning(`✅ Family ${familyDocSnap.id} synced via RTDB index.`);
                } else {
                    setIsEditing(true); 
                    setWarning("⚠️ RTDB index mila, par family data Firestore mein nahi mila. Naya family banao.");
                }
            } else {
                // RTDB index mein nahi mila (Brand new user/Join mode)
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
      console.log("MEMBER ACTION: Edit cancelled/Form cleared.");
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
    const localForageKey = `profileData_${user.uid}`;
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

                let updatedMembers = existingFamilyData.members.map(m => {
                    if (m.mobile === currentUserData.mobile && m.countryCode === currentUserData.countryCode) {
                        return { ...m, userId: user.uid }; // Update existing user entry
                    }
                    return m;
                });
                
                // If user wasn't in members array by mobile/countryCode, add them
                if (!updatedMembers.some(m => m.userId === user.uid)) {
                     updatedMembers.push({ ...currentUserData, userId: user.uid });
                }

                finalFamilyPayload = {
                    ...existingFamilyData,
                    members: updatedMembers,
                    updatedAt: serverTimestamp(),
                };
                
                await updateDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); // 👈 FIREBASE WRITE
                await set(userIndexRef, familyIdToSave); // 👈 RTDB WRITE (Index)
                successMessage = `✅ Family ${familyIdToSave} joined and data synced!`;

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
                    members: finalMembersToSave,
                    pin, 
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                };
                
                // 1. FIREBASE WRITE: Create family document
                await setDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload); 
                console.log("TRACE: Firestore family doc created successfully at:", familyIdToSave);
                
                // 2. RTDB WRITE: Create user index (The step that was previously failing)
                try {
                    console.log("TRACE: Attempting RTDB Index write for UID:", user.uid, "with SRNO:", familyIdToSave);
                    await set(userIndexRef, familyIdToSave); 
                    console.log("TRACE: RTDB Index write successful!");
                    successMessage = `✅ New Family created! ID (SRNO): ${familyIdToSave}. Index synced.`;
                } catch (rtdbErr) {
                    // CRITICAL ERROR: Document created, but index failed.
                    console.error("TRACE ERROR: RTDB Index write FAILED. Document created but index failed.", rtdbErr);
                    // Throw the error to stop the process and alert the user
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
            pin: finalFamilyPayload.pin || profile?.pin || joinSrno, // Pin/SRNO ko local data mein store karna zaroori hai
            updatedAt: Date.now(), 
            createdAt: finalFamilyPayload.createdAt || profile?.createdAt
        };
        
        await updateProfile(localDataToSave); // Saves to state and localforage
        setMembers(finalMembersToSave); // Sync members state
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

  const handleDataSync = async () => {
    // ... (Data sync logic) ...
  };

  const isReadyForMembers = 
    profile?.id || 
    (joinSrno.trim().length > 0) || 
    (formData.nativeCity.trim().length > 0 && formData.currentCity.trim().length > 0); 
    
  const canSaveFamily = isReadyForMembers && (members.length > 0 || canAdd);

  return (
    <div className="p-3">
      {/* 1. Sync button */}
      {profile && !editingId && (
        <button
          onClick={handleDataSync}
          className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
          disabled={loading}
        >
          {loading ? "સિંક થઈ રહ્યું છે..." : "✏️ ડેટા સિંક કરો અને સંપાદિત કરો"}
        </button>
      )}

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
      
      {/* 3. Member List */}
      {user && (profile?.id || members.length > 0) && (
          <MemberList
            members={members}
            startEditMember={startEditMember}
            deleteMember={deleteMember}
          />
      )}

      {/* 4. MemberForm (Now uses the correct prop names) */}
      {user && (profile?.id || isReadyForMembers) && (
          <MemberForm
            formData={formData}
            setFormData={setFormData}
            handleMemberSave={handleAdd} // 📌 Maps to handleAdd (single member save)
            handleCancelEdit={handleCancelEdit} // 📌 Function to cancel editing
            editingId={editingId}
          />
      )}
      
      {/* 5. Family Save Button (This calls handleFinish) */}
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
            : profile?.id 
            ? "ફેરફારો સેવ કરો (Family Update)" 
            : "ડેટા સેવ કરો (Family Create)"
          }
        </button>
      )}

      {/* Fallback Message */}
      {user && !loading && !profile?.id && !isReadyForMembers && (
        <p className="text-gray-600 mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
          🔑 કૃપા કરીને પહેલા વતન, હાલનું શહેર ભરો અથવા ફેમિલી SRNO દાખલ કરો.
        </p>
      )}

      {/* 6. Warning / Messages */}
      {warning && <p className="text-red-500 mt-2">{warning}</p>}

      {/* 7. Modal */}
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