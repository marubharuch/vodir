// ✅ CombinedForm.jsx Summary (Hinglish):
// Ye component ek Family management form hai jo user ko 
// - Apni family banane, join karne, aur update karne deta hai.
// - Data localforage (local storage) me save hota hai, aur Firestore se sync bhi ho sakta hai.
// - Members add/edit/delete kar sakte ho (name, gender, mobile).
// - PIN system hai family join karne ke liye.
// - Agar profile already hai toh sync aur update ka option milta hai.

// Features:
// - CityInputs: Vatan aur Current City enter karne ke liye.
// - MemberList: Already added members show karta hai (edit/delete option).
// - MemberForm: New member add/edit karne ke liye form.
// - handleFinish: Family data save karta hai (localforage me) aur join/create/update logic handle karta hai.
// - handleDataSync: Firestore se latest data sync karta hai.

import React, { useState, useEffect } from "react";
import { useProfile } from "../context/ProfileContext";
import { datastore } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import localforage from "localforage";

import CityInputs from "./CityInputs";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";

const CombinedForm = () => {
  const { profile, updateProfile } = useProfile(); // ✅ Context se profile aur update fn
  const { user } = useAuth(); // ✅ AuthContext se logged-in user
if(user)console.log("prof",user)

// Get the user and profile from your context



// A boolean variable to hold the result of the check
const isUserAMember = profile?.members?.some(
  (member) => member.userId === user?.uid
);

if (isUserAMember) {
  console.log("The user is a member of this family.");
  // Your logic for a logged-in member goes here
} else {
  console.log("The user is NOT a member of this family.");
  // Your logic for a user who needs to join or create a family goes here
}


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
  const [joinPin, setJoinPin] = useState(""); // ✅ Family join karne ke liye PIN
  const [warning, setWarning] = useState(""); // ✅ Error / Info messages
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const [isEditing, setIsEditing] = useState(false); // ✅ Editing flag
  const [editingId, setEditingId] = useState(null); // ✅ Currently edit ho raha member ka ID

  // ✅ On mount / profile change => Family fetch karo (Firestore se ya local profile se)
useEffect(() => {
    const fetchFamilyProfile = async () => {
      // 1. Check if we already have the profile data in context.
      if (profile?.id) { // Use profile?.id to ensure it's a valid object, not just non-null
        // Data is already loaded from Context, just update the local form states
console.log("use effect")
        setFormData((s) => ({
          ...s,
          nativeCity: profile.nativeCity || "",
          currentCity: profile.currentCity || "",
        }));
        setMembers(profile.members || []);
        setJoinPin(profile.pin || "");
        setIsEditing(true);
        setWarning("✅ તમારો ફેમિલી ડેટા લોડ થઈ ગયો છે!"); // Optional message
        console.log("profile context",profile.members)
        

        return; // Exit here. No need to fetch again.
      }

      // 2. If no profile in context, check Firestore.
      if (isUserAMember) {
        console.log("opt 2")
        setLoading(true);
        try {
          // ... (Your existing Firestore fetching logic remains here)
            const familiesRef = collection(datastore, "families");
            const querySnapshot = await getDocs(familiesRef);

            let foundFamily = null;
            querySnapshot.forEach((doc) => {
              const familyData = doc.data();
              const isMember = familyData.members.some(
                (member) => member.userId === user.uid
              );
              if (isMember) {
                foundFamily = { ...familyData, id: doc.id };
              }
            });
            // ... (End of existing Firestore fetching logic)

          if (foundFamily) {
            // ⚠️ ONLY UPDATE CONTEXT ONCE HERE
            updateProfile(foundFamily); 
            // Local states will be set by the re-run that the context update triggers (Step 1)
            setWarning("✅ તમારો ફેમિલી ડેટા સિંક થઈ ગયો છે!");
          } else {
            setIsEditing(false);
            setWarning("⚠️ તમારા માટે કોઈ ફેમિલી ડેટા મળ્યો નથી.");
          }
        } catch (err) {
          setWarning("⚠️ ડેટા મેળવવામાં ભૂલ થઈ.");
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFamilyProfile();
  }, [profile, user, updateProfile]);

  // ✅ Member add/edit condition check
  const canAdd =
    formData.gender &&
    formData.name.trim() &&
    formData.countryCode.startsWith("+") &&
    formData.mobile.trim();

  // ✅ Ek member ko list me add karna (ya edit karna)
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

    if (editingId) {
      // Agar edit mode hai to update karo
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, ...formData, name: formData.name.trim() }
            : m
        )
      );
      setEditingId(null);
    } else {
      // Naya member add karo
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

    // ✅ Reset form fields
    setFormData((s) => ({
      ...s,
      gender: "",
      name: "",
      countryCode: "+91",
      mobile: "",
    }));
  };

  // ✅ Family create/update/join karne ka main function
{/*  const handleFinish = async () => {
    setLoading(true);
    setWarning("finish function");

    // Agar form me ek member ka data hai aur editing nahi ho rahi to usko add kar lo
    if (canAdd && !editingId) {
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

    // Agar members bilkul nahi hai aur PIN bhi nahi hai
    if (members.length === 0 && !joinPin.trim() && !(canAdd && !editingId)) {
      setWarning("⚠️ ઓછામાં ઓછો એક સભ્ય ઉમેરો.");
      setLoading(false);
      return;
    }

    try {
      // ✅ LocalForage me families fetch karo
      let families = (await localforage.getItem("families_${user.uid}")) || [];

      if (joinPin.trim() && !profile?.id) {
        // ✅ JOIN FAMILY LOGIC
        const existingFamily = families.find((f) => f.pin === joinPin);

        if (existingFamily) {
          const newMemberData = {
            id: crypto.randomUUID(),
            userId: user.uid,
            gender: formData.gender,
            name: formData.name.trim(),
            countryCode: formData.countryCode,
            mobile: formData.mobile,
          };

          // Agar same mobile wala member pehle se hai to update karo
          const existingMemberIndex = existingFamily.members.findIndex(
            (m) =>
              m.mobile === newMemberData.mobile &&
              m.countryCode === newMemberData.countryCode
          );

          if (existingMemberIndex > -1) {
            existingFamily.members[existingMemberIndex] = {
              ...existingFamily.members[existingMemberIndex],
              ...newMemberData,
            };
          } else {
            existingFamily.members.push(newMemberData);
          }

          // ✅ Update localforage
          families = families.map((f) =>
            f.pin === joinPin ? existingFamily : f
          );
          await localforage.setItem("families_${user.uid}", families);

          updateProfile({ ...existingFamily, pin: joinPin });
          alert("✅ ફેમિલીમાં જોડાયા!");
        } else {
          setWarning("⚠️ અમાન્ય PIN. ફેમિલી મળી નથી.");
        }
      } else {
        // ✅ CREATE OR UPDATE FAMILY LOGIC
        if (members.length === 0) {
          setWarning("⚠️ ઓછામાં ઓછો એક સભ્ય ઉમેરો.");
          return;
        }

        if (profile?.id) {
          // 🔄 Family update karo
          families = families.map((f) =>
            f.id === profile.id
              ? {
                  ...f,
                  nativeCity: formData.nativeCity,
                  currentCity: formData.currentCity,
                  members: members,
                  updatedAt: Date.now(),
                }
              : f
          );

          await localforage.setItem("families_${user.uid}", families);
          updateProfile({
            ...profile,
            nativeCity: formData.nativeCity,
            currentCity: formData.currentCity,
            members,
          });
          setWarning("✅ Family updated!");
        } else {
          // 🆕 New family create karo
          const pin = Math.floor(1000 + Math.random() * 9000).toString();
          const familyPayload = {
            id: crypto.randomUUID(),
            pin,
            nativeCity: formData.nativeCity,
            currentCity: formData.currentCity,
            createdBy: user.uid,
            members,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          families.push(familyPayload);
          await localforage.setItem("families_${user.uid}", families);

          updateProfile(familyPayload);
          setJoinPin(pin);
          alert(`✅ નવો Family bana! તમારો PIN: ${pin}`);
        }
      }

      setIsEditing(true);
    } catch (err) {
      setWarning(`⚠️ ભૂલ થઈ.`);
      console.error("LocalForage error:", err);
    } finally {
      setLoading(false);
    }
  };
*/}// ✅ Family create/update/join karne ka main function
const handleFinish = async () => {
  setLoading(true);

  // 1. Agar form me ek member ka data hai aur editing nahi ho rahi to usko add kar lo
  if (canAdd && !editingId) {
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

  // 2. Agar members bilkul nahi hai aur PIN bhi nahi hai
  const currentMembers = members.length > 0 ? members : (canAdd && !editingId) ? [{
    id: crypto.randomUUID(),
    userId: user.uid,
    gender: formData.gender,
    name: formData.name.trim(),
    countryCode: formData.countryCode,
    mobile: formData.mobile,
  }] : [];

  if (currentMembers.length === 0 && !joinPin.trim()) {
    setWarning("⚠️ ઓછામાં ઓછો એક સભ્ય ઉમેરો.");
    setLoading(false);
    return;
  }

  try {
    // 3. ✅ LocalForage me families fetch karo
    let families = (await localforage.getItem("families")) || [];

    if (joinPin.trim() && !profile?.id) {
      // 🤝 JOIN FAMILY LOGIC (Only LocalForage)
      const existingFamily = families.find((f) => f.pin === joinPin);
      if (existingFamily) {
        const newMemberData = {
          id: crypto.randomUUID(),
          userId: user.uid,
          gender: formData.gender,
          name: formData.name.trim(),
          countryCode: formData.countryCode,
          mobile: formData.mobile,
        };
        const existingMemberIndex = existingFamily.members.findIndex(
          (m) => m.mobile === newMemberData.mobile && m.countryCode === newMemberData.countryCode
        );

        if (existingMemberIndex > -1) {
          existingFamily.members[existingMemberIndex] = {
            ...existingFamily.members[existingMemberIndex],
            ...newMemberData,
          };
        } else {
          existingFamily.members.push(newMemberData);
        }

        families = families.map((f) => (f.pin === joinPin ? existingFamily : f));
        await localforage.setItem("families", families);
        updateProfile({ ...existingFamily, pin: joinPin });
        alert("✅ ફેમિલીમાં જોડાયા!");
      } else {
        setWarning("⚠️ અમાન્ય PIN. ફેમિલી મળી નથી.");
      }
    } else {
      // 🆕 CREATE or UPDATE FAMILY LOGIC (LocalForage and Firestore)
      const familyPayload = {
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        members: currentMembers,
        updatedAt: serverTimestamp(),
      };

      if (profile?.id) {
        // 🔄 UPDATE Existing family in Firestore
        const familyDocRef = doc(datastore, "families", profile.id);
        await updateDoc(familyDocRef, familyPayload);
        setWarning("✅ Family updated to Firestore!");

        // Update localforage
        const updatedLocalFamilies = families.map((f) =>
          f.id === profile.id ? { ...f, ...familyPayload } : f
        );
        await localforage.setItem("families", updatedLocalFamilies);
        updateProfile({ ...profile, ...familyPayload });

      } else {
        // 🆕 CREATE New family in Firestore
        const familiesCollectionRef = collection(datastore, "families");
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        const newDocRef = doc(familiesCollectionRef);

        const newFamilyPayload = {
          ...familyPayload,
          pin,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          id: newDocRef.id, // Store Firestore ID locally
        };

        await setDoc(newDocRef, newFamilyPayload);
        setJoinPin(pin);
        alert(`✅ નવો Family બનાવો! તમારો PIN: ${pin}`);
        setWarning("✅ New family created in Firestore!");

        // Store in localforage after successful Firestore operation
        families.push(newFamilyPayload);
        await localforage.setItem("families", families);
        updateProfile(newFamilyPayload);
      }
    }

    setIsEditing(true);
  } catch (err) {
    setWarning(`⚠️ ભૂલ થઈ.`);
    console.error("Operation error:", err);
  } finally {
    setLoading(false);
  }
};

  // ✅ Member edit mode activate karna
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

  // ✅ Member delete
  const deleteMember = (id) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
  };

  // ✅ Firestore se sync karna (manual refresh)
  const handleDataSync = async () => {
    if (!profile?.id) {
      setWarning("⚠️ કોઈ પ્રોફાઇલ નથી.");
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(datastore, "families", profile.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        updateProfile({ ...firestoreData, id: profile.id });
        setMembers(firestoreData.members || []);
        setFormData((s) => ({
          ...s,
          nativeCity: firestoreData.nativeCity,
          currentCity: firestoreData.currentCity,
        }));
        setWarning("✅ Firestore sync success!");
      } else {
        setWarning("⚠️ Firestore me data nahi mila.");
      }
    } catch (err) {
      setWarning("⚠️ Sync error.");
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      {/* ✅ Agar profile hai aur edit mode nahi hai to Sync button dikhao */}
      {profile && !editingId && (
        <button
          onClick={handleDataSync}
          className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
          disabled={loading}
        >
          {loading ? "સિંક થઈ રહ્યું છે..." : "✏️ ડેટા સિંક કરો અને સંપાદિત કરો"}
        </button>
      )}

      {/* ✅ CityInputs, MemberList aur MemberForm dikhana */}
      {(!profile || isEditing) && (
        <>
          <CityInputs
            formData={formData}
            setFormData={setFormData}
            joinPin={joinPin}
            setJoinPin={setJoinPin}
            profile={profile}
          />

          <MemberList
            members={members}
            startEditMember={startEditMember}
            deleteMember={deleteMember}
          />

          <MemberForm
            formData={formData}
            setFormData={setFormData}
            handleAdd={handleAdd}
            handleFinish={handleFinish}
            editingId={editingId}
            profile={profile}
            joinPin={joinPin}
          />
        </>
      )}

      {/* ✅ Warning / Messages */}
      {warning && <p className="text-red-500 mt-2">{warning}</p>}
    </div>
  );
};

export default CombinedForm;
