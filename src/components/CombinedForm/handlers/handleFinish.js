// 🔥 RTDB + Safe Email Version
import { ref, runTransaction, set, update, get } from "firebase/database";
import { db } from "../../../firebase";
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

  setLoading(true);
  setWarning("");
  console.log("handle finish (RTDB)");

  try {
    const currentUserEmail = user.email;
    const safeEmail = currentUserEmail.replace(/\./g, "_");

    let successMessage = "";
    let familyIdToSave = profile?.id;

    const userIndexRef = ref(db, `users/${safeEmail}/familySrno`);
    const masterIndexRef = ref(db, "master/familyIndex");

    let finalFamilyPayload = {};

    // --------------------------------------------------------
    // CREATE MODE
    // --------------------------------------------------------
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
        createdBy: safeEmail,
        createdAt: Date.now(),
        editorEmails: { [safeEmail]: true },
        pendingEditorEmails: {},
        updatedAt: Date.now(),
        lastUpdateTimestamp: Date.now(),
      };

      // save full family
      await set(ref(db, `families/${familyIdToSave}`), finalFamilyPayload);

      // link user
      await set(userIndexRef, familyIdToSave);

      // summary table
      await set(ref(db, `familyDetails/${familyIdToSave}`), {
        lastUpdateTimestamp: Date.now(),
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        totalMembers: members.length,
      });

      successMessage = `✅ New Family created! ID (SRNO): ${familyIdToSave}`;
    }

    // --------------------------------------------------------
    // UPDATE MODE
    // --------------------------------------------------------
    else {
      await handleUpdateFamily(
        familyIdToSave,
        members,
        safeEmail,
        profile,
        formData,
        userIndexRef,
        null,
        (msg) => (successMessage = msg),
        setLoading
      );
    }

    // --------------------------------------------------------
    // UPDATE LOCAL CACHE
    // --------------------------------------------------------
    const localTime = Date.now();

    const savedData = {
      ...(profile || {}),
      ...finalFamilyPayload,
      id: familyIdToSave,
      members,
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
      updatedAt: localTime,
      lastUpdateTimestamp: localTime,
      createdAt: profile?.createdAt || localTime,
    };

    await updateProfile(savedData);
    await localforage.setItem(`profileData_${safeEmail}`, savedData);

    alert(successMessage);

  } catch (err) {
    console.error("Save Error:", err);
    setWarning("⚠️ Family save failed.");
  } finally {
    setLoading(false);
  }
}
