// 🔥 FINAL SIMPLIFIED RTDB Version (Object Arguments)
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
  console.log("🔍 handleFinish args:", {
    profile,
    user,
    members,
    formData,
    hasSetWarning: typeof setWarning === "function",
    hasSetLoading: typeof setLoading === "function",
  });

  // -------------------------------------------------------
  // BASIC VALIDATION
  // -------------------------------------------------------
  if (!user?.email) {
    setWarning("❌ યુઝરનો ઇમેલ મળતો નથી. ફરીથી લોગિન કરો.");
    return;
  }

  if (typeof setWarning !== "function") {
    console.error("❌ setWarning is missing!");
    return;
  }

  if (typeof setLoading !== "function") {
    console.error("❌ setLoading is missing!");
    setWarning("⚠️ Internal error: loading handler missing.");
    return;
  }

  setLoading(true);
  setWarning("");

  try {
    console.log("handleFinish (RTDB)");

    const safeEmail = user.email.replace(/\./g, "_");
    const userIndexRef = ref(db, `users/${safeEmail}/familySrno`);
    const masterIndexRef = ref(db, "master/familyIndex");

    let successMessage = "";
    let familyIdToSave = profile?.id;
    let finalFamilyPayload = {};

    // -------------------------------------------------------
    // CREATE MODE
    // -------------------------------------------------------
    if (!profile?.id) {
      console.log("🆕 Creating new family...");

      const result = await runTransaction(masterIndexRef, (data) => {
        let next = data?.nextSrno || 1;
        return { nextSrno: next + 1 };
      });

      const newSrno = result.snapshot.val().nextSrno - 1;
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

      // Save full family
      await set(ref(db, `families/${familyIdToSave}`), finalFamilyPayload);

      // Link user
      await set(userIndexRef, familyIdToSave);

      // Summary table
      await set(ref(db, `familyDetails/${familyIdToSave}`), {
        lastUpdateTimestamp: Date.now(),
        nativeCity: formData.nativeCity,
        currentCity: formData.currentCity,
        totalMembers: members.length,
      });

      successMessage = `✅ નવું ફેમિલી બનાવાયું! SRNO: ${familyIdToSave}`;
    }

    // -------------------------------------------------------
    // UPDATE MODE
    // -------------------------------------------------------
    else {
      console.log("📝 Updating existing family...");

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

    // -------------------------------------------------------
    // UPDATE LOCAL CACHE
    // -------------------------------------------------------
    const now = Date.now();

    const savedData = {
      id: familyIdToSave,
      ...finalFamilyPayload,
      ...profile, // keep existing keys
      members,
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
      updatedAt: now,
      lastUpdateTimestamp: now,
      createdAt: profile?.createdAt || now,
    };

    await updateProfile(savedData);

    await localforage.setItem(`profileData_${safeEmail}`, savedData);

    alert(successMessage);
  } catch (err) {
    console.error("❌ Save Error:", err);
    setWarning("⚠️ Family save failed.");
  } finally {
    setLoading(false);
  }
}
