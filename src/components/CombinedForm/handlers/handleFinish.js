// 🔥 UID-Based Final Version
import { ref, runTransaction, set, update, get } from "firebase/database";
import { db } from "../../../firebase";
import localforage from "localforage";
import { handleUpdateFamily } from "../utils/familyHelpers";

export async function handleFinish({
  profile,
  user,
  updateProfile,
  members,
  formData,
  setMembers,
  setWarning,
  setLoading,
}) {
  // Basic checks
  if (!user?.uid) {
    setWarning("❌ User UID missing. Please login again.");
    return;
  }

  if (!user?.email) {
    setWarning("❌ User email missing. Please login again.");
    return;
  }

  setLoading(true);
  setWarning("");

  try {
    const uid = user.uid;                         // ⭐ REAL KEY
    const userRef = ref(db, `users/${uid}`);      // ⭐ FIXED
    const familySrnoRef = ref(db, `users/${uid}/familySrno`);
    const masterIndexRef = ref(db, "master/familyIndex");

    let successMessage = "";
    let familyIdToSave = profile?.id;
    let finalFamilyPayload = {};

    // -------------------------------------------------------
    // 🆕 CREATE NEW FAMILY
    // -------------------------------------------------------
    if (!profile?.id) {
      console.log("🆕 Creating new family using UID key…");

      // 1. Generate next family ID
      const txn = await runTransaction(masterIndexRef, (data) => {
        let next = data?.nextSrno || 1;
        return { nextSrno: next + 1 };
      });

      const newSrno = txn.snapshot.val().nextSrno - 1;
      familyIdToSave = newSrno.toString();

      const now = Date.now();

      // 2. Build new family object
      finalFamilyPayload = {
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        members,
        createdBy: uid,            // ⭐ FIXED - UID, not email
        createdAt: now,
        editorEmails: { [uid]: true },   // ⭐ FIXED
        pendingEditorEmails: {},
        updatedAt: now,
        lastUpdateTimestamp: now,
      };

      // 3. Save full family node
      await set(ref(db, `families/${familyIdToSave}`), finalFamilyPayload);

      // 4. Link family to user
      await set(familySrnoRef, familyIdToSave);

      // 5. Summary node
      await set(ref(db, `familyDetails/${familyIdToSave}`), {
        lastUpdateTimestamp: now,
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        totalMembers: members.length,
      });

      successMessage = `🎉 New family created! SRNO: ${familyIdToSave}`;
    }

    // -------------------------------------------------------
    // ✏️ UPDATE EXISTING FAMILY
    // -------------------------------------------------------
    else {
      await handleUpdateFamily(
        familyIdToSave,
        members,
        uid,                        // ⭐ FIXED
        profile,
        formData,
        familySrnoRef,
        null,
        (msg) => (successMessage = msg),
        setLoading
      );
    }

    // -------------------------------------------------------
    // 💾 UPDATE LOCAL CACHE + PROFILE CONTEXT
    // -------------------------------------------------------
    const now = Date.now();

    const savedData = {
      id: familyIdToSave,
      members,
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
      updatedAt: now,
      lastUpdateTimestamp: now,
      createdAt: profile?.createdAt || now,
      editorEmails: { ...(profile?.editorEmails || {}), [uid]: true },
      ...finalFamilyPayload,
      ...profile,
    };

    // Save to profile context
    await updateProfile(savedData);

    // Save to LocalForage (UID KEY - ⭐ FIXED)
    await localforage.setItem(`profileData_${uid}`, savedData);

    alert(successMessage);
  } catch (err) {
    console.error("❌ Save Error:", err);
    setWarning("⚠️ Family save failed.");
  } finally {
    setLoading(false);
  }
}
