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

    // CREATE NEW FAMILY
    if (!profile?.id) {
      let newSrno;
      const result = await runTransaction(masterIndexRef, (data) => {
        let next = data?.nextSrno || 1;
        return { nextSrno: next + 1 };
      });
      newSrno = result.snapshot?.val()?.nextSrno - 1;
      familyIdToSave = newSrno.toString();

      const finalFamilyPayload = {
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
    }

    // LOCAL CACHE UPDATE
    const localTime = Date.now();
    const savedData = {
      ...profile,
      id: familyIdToSave,
      members,
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
      updatedAt: localTime,
      lastUpdateTimestamp: localTime,
    };
    await updateProfile(savedData);

    await localforage.setItem(`profileData`, savedData);
    alert(successMessage);
  } catch (err) {
    console.error("Save Error:", err);
    setWarning("⚠️ Family save failed.");
  } finally {
    setLoading(false);
  }
}
