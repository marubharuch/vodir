// src/components/CombinedForm/handlers/handleFinish.js

import { doc, setDoc, updateDoc, getDoc, serverTimestamp, collection } from "firebase/firestore";
import { ref, runTransaction, set } from "firebase/database";
import { datastore, db } from "../../../firebase";
import localforage from "localforage";
import { handleUpdateFamily } from "../utils/familyHelpers";

export async function handleFinish(
  profile,
  user,
  updateProfile,
  members,
  formData,
  setMembers,
  setWarning,
  setLoading
) {
  if (!user?.email) {
    setWarning("❌ યુઝરનો ઇમેલ મળતો નથી. ફરીથી લોગિન કરો.");
    return;
  }
console.log("handle finish")
  setLoading(true);
  setWarning("");

  try {
    const familiesRef = collection(datastore, "families");
    const userIndexRef = ref(db, `users/${user.uid}/familySrno`);
    const masterIndexRef = ref(db, "master/familyIndex");
    const currentUserEmail = user.email;
    let successMessage = "";
    let familyIdToSave = profile?.id;

    // 💡 NEW: finalFamilyPayload ને અહીં જાહેર કરો જેથી તે Local Update માં ઉપલબ્ધ હોય
    let finalFamilyPayload = {}; 

    // CREATE NEW FAMILY
    if (!profile?.id) {
      let newSrno;
      const result = await runTransaction(masterIndexRef, (data) => {
        let next = data?.nextSrno || 1;
        return { nextSrno: next + 1 };
      });
      newSrno = result.snapshot?.val()?.nextSrno - 1;
      familyIdToSave = newSrno.toString();

      finalFamilyPayload = {
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        members,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        editorEmails: [currentUserEmail],
        pendingEditorEmails: [],
      };

      await setDoc(doc(familiesRef, familyIdToSave), finalFamilyPayload);
      await set(userIndexRef, familyIdToSave);

      successMessage = `✅ New Family created! ID (SRNO): ${familyIdToSave}`;

      const summaryRef = ref(db, `familyDetails/${familyIdToSave}`);
      await set(summaryRef, {
        lastUpdateTimestamp: Date.now(),
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        totalMembers: members.length,
      });
    }
    // UPDATE EXISTING FAMILY
    else {
      const result = await handleUpdateFamily(
        familyIdToSave,
        members,
        currentUserEmail,
        profile,
        formData,
        userIndexRef,
        familiesRef,
        (msg) => (successMessage = msg),
        setLoading
      );
      // 💡 NEW: handleUpdateFamily નું અપડેટ થયેલું Payload અહીં સ્ટોર કરો (જો તે પાછું આવતું હોય)
      // જો handleUpdateFamily આખું payload પાછું ન આપે, તો local update માટે ...profile પર આધાર રાખો.
      // આ સરળતા માટે, અમે ...profile પર આધાર રાખીશું, પરંતુ તેને સુરક્ષિત રીતે મર્જ કરીશું.
    }

    // LOCAL CACHE UPDATE
    const localTime = Date.now();
    
    // 🛑 CRITICAL FIX: ...profile ને સુરક્ષિત રીતે મર્જ કરો. 
    // જો profile null હોય, તો ખાલી ઓબ્જેક્ટ ({}) નો ઉપયોગ કરો.
    const savedData = {
      ...(profile || {}), // ⬅️ જો profile null હોય, તો પણ ખાલી ઓબ્જેક્ટ મર્જ થશે, જેથી Error ન આવે.
      
      // CREATE Mode માંના createdBy અને editorEmails ને મર્જ કરો
      ...finalFamilyPayload, // ⬅️ આનાથી createdBy, editorEmails (Create Mode માં) અને અન્ય ફીલ્ડ્સ આવશે.

      // ફોર્મ ડેટાને હંમેશા ઓવરરાઇડ કરો
      id: familyIdToSave,
      members,
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
      
      // ટાઇમસ્ટેમ્પ્સને ક્લાયન્ટ ટાઇમ વડે ઓવરરાઇડ કરો
      updatedAt: localTime,
      lastUpdateTimestamp: localTime,
      
      // 💡 CRITICAL FIX: serverTimestamp() ને બદલે વાસ્તવિક સમય સેવ કરો
      // (Create Mode માં)
      createdAt: (profile?.createdAt || localTime), 
    };
    
    // Debugging (તમે આને પેસ્ટ ન કરી શકો, પરંતુ આનાથી ખબર પડશે કે createdBy સેવ થયું છે)
    console.log("Final savedData object:", savedData); 

    await updateProfile(savedData);
    

    await localforage.setItem(`profileData_${user.uid}`, savedData);
    alert(successMessage);
  } catch (err) {
    console.error("Save Error:", err);
    setWarning("⚠️ Family save failed.");
  } finally {
    setLoading(false);
  }
}