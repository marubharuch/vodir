// src/components/CombinedForm/handlers/handleFinish.js
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
  setWarning,
  setLoading,
}) {
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
    const uid = user.uid;
    const familySrnoRef = ref(db, `users/${uid}/familySrno`);
    const masterIndexRef = ref(db, "master/familyIndex");

    let familyId = profile?.id;
    let successMessage = "";
    let fullFamilyData = {};
    const now = Date.now();

    /* -------------------------------------------------------
       CREATE NEW FAMILY
    -------------------------------------------------------- */
    if (!familyId) {
      const txn = await runTransaction(masterIndexRef, (data) => {
        let next = data?.nextSrno || 1;
        return { nextSrno: next + 1 };
      });

      const newSrno = txn.snapshot.val().nextSrno - 1;
      familyId = newSrno.toString();

      fullFamilyData = {
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        members,
        createdBy: uid,
        createdAt: now,
        editorEmails: { [uid]: true }, // creator auto-editor
        pendingEditorEmails: {}, // UID-based
        updatedAt: now,
        lastUpdateTimestamp: now,
      };

      await set(ref(db, `families/${familyId}`), fullFamilyData);
      await set(familySrnoRef, familyId);
    }

    /* -------------------------------------------------------
       UPDATE EXISTING FAMILY
    -------------------------------------------------------- */
    else {
      await handleUpdateFamily(
        familyId,
        members,
        uid,
        profile,
        formData,
        familySrnoRef,
        null,
        (msg) => (successMessage = msg),
        setLoading
      );

      const snap = await get(ref(db, `families/${familyId}`));
      fullFamilyData = snap.val();
    }

    /* -------------------------------------------------------
       LOAD ALL USERS (needed for UID → email conversion)
    -------------------------------------------------------- */
    const usersSnap = await get(ref(db, "users"));
    const allUsers = usersSnap.val() || {};

    /* -------------------------------------------------------
       BUILD CLEAN PROFILE FOR UI
    -------------------------------------------------------- */
    const cleanProfile = {
      id: familyId,
      nativeCity: fullFamilyData.nativeCity,
      currentCity: fullFamilyData.currentCity,

      members: Object.keys(fullFamilyData.members || {}).map((id) => ({
        id,
        ...fullFamilyData.members[id],
      })),

      createdAt: fullFamilyData.createdAt,
      createdBy: fullFamilyData.createdBy,
      updatedAt: fullFamilyData.updatedAt,
      lastUpdateTimestamp: fullFamilyData.lastUpdateTimestamp,

      editorEmails: Object.keys(fullFamilyData.editorEmails || {}),

      pendingEditorEmails: Object.keys(fullFamilyData.pendingEditorEmails || {}).map(
        (pendingUid) => ({
          uid: pendingUid,
          email: allUsers[pendingUid]?.email || "unknown",
          name: allUsers[pendingUid]?.name || "",
          mobile: allUsers[pendingUid]?.mobile || "",
        })
      ),
    };

    /* -------------------------------------------------------
       SAVE TO CACHE + CONTEXT
    -------------------------------------------------------- */
    await updateProfile(cleanProfile);
    await localforage.setItem(`profileData_${uid}`, cleanProfile);

    console.log("📦 FINAL PROFILE SAVED:", cleanProfile);
    if (!successMessage) successMessage = "✔ Family updated!";
    alert(successMessage);
  } catch (err) {
    console.error("❌ Save Error:", err);
    setWarning("⚠️ Family save failed.");
  } finally {
    setLoading(false);
  }
}
