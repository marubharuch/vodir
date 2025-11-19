// src/components/CombinedForm/handlers/handleFinish.js

import { ref, runTransaction, set, update } from "firebase/database";
import { db } from "../../../firebase";
import localforage from "localforage";

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
  if (!user?.uid) {
    setWarning("❌ User not found");
    return;
  }

  console.log("handleFinish");

  setLoading(true);
  setWarning("");

  try {
    const userRef = ref(db, `users/${user.uid}`);
    const masterIndexRef = ref(db, "master/familyIndex");

    let familyId = profile?.id;

    // Convert members array → object with id keys
    const membersObj = {};
    members.forEach((m) => {
      membersObj[m.id] = { ...m };
    });

    // Convert editorEmails array → object format
    const safeEmail = user.email.replace(/\./g, "_");
    const editorEmailsObj = { [safeEmail]: true };

    let finalFamilyData;

    // ----------------------------------------
    // CREATE NEW FAMILY
    // ----------------------------------------
    if (!familyId) {
      const result = await runTransaction(masterIndexRef, (data) => {
        const next = data?.nextSrno || 1;
        return { nextSrno: next + 1 };
      });

      familyId = (result.snapshot.val().nextSrno - 1).toString();

      finalFamilyData = {
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        members: membersObj,
        createdBy: user.uid,
        createdAt: Date.now(),
        editorEmails: editorEmailsObj,
      };

      // SAVE FAMILY DATA TO RTDB
      await set(ref(db, `families/${familyId}`), finalFamilyData);

      // LINK USER → FAMILY
      await update(userRef, { familySrno: familyId });

      // Save summary for master
      await set(ref(db, `familyDetails/${familyId}`), {
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        totalMembers: members.length,
        lastUpdateTimestamp: Date.now(),
      });
    }

    // ----------------------------------------
    // UPDATE EXISTING FAMILY
    // ----------------------------------------
    else {
      finalFamilyData = {
        ...profile,
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        members: membersObj,
        editorEmails: profile.editorEmails || {}, // keep existing editors
        updatedAt: Date.now(),
      };

      await update(ref(db, `families/${familyId}`), finalFamilyData);

      await update(ref(db, `familyDetails/${familyId}`), {
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        totalMembers: members.length,
        lastUpdateTimestamp: Date.now(),
      });
    }

    // ------------------------------------------------------
    // SAVE LOCALLY (IMPORTANT)
    // ------------------------------------------------------
    const cacheKey = `profileData_${user.uid}`;
    await localforage.setItem(cacheKey, { id: familyId, ...finalFamilyData });

    updateProfile({ id: familyId, ...finalFamilyData });

    alert("Family saved successfully!");
  } catch (err) {
    console.error("Save Error:", err);
    setWarning("⚠️ Failed to save family.");
  } finally {
    setLoading(false);
  }
}
