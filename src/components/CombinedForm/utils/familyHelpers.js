// 🔥 RTDB-ONLY VERSION
// src/components/CombinedForm/utils/familyHelpers.js

import { ref, get, update } from "firebase/database";
import { db } from "../../../firebase";

/**
 * ---------------------------------------------------------
 * 🧩 handleUpdateFamily (RTDB version)
 * Updates: members, cities, editorEmails, pendings, etc.
 * ---------------------------------------------------------
 */
export async function handleUpdateFamily(
  familyIdToSave,
  members,
  currentUserEmail,
  profile,
  formData,
  userIndexRef,     // kept for signature compatibility
  familiesRef,      // Firestore version not needed anymore
  successMessageCallback,
  setLoadingCallback
) {
  try {
    const familyRef = ref(db, `families/${familyIdToSave}`);
    const familySnap = await get(familyRef);

    if (!familySnap.exists()) {
      throw new Error("Family not found in RTDB");
    }

    const familyData = familySnap.val();

    // Build RTDB-safe email maps
    const editorEmails = familyData.editorEmails || {};
    const pendingEditorEmails = familyData.pendingEditorEmails || {};

    // ---------------------------------------------------------
    // 🔄 Prepare update payload
    // ---------------------------------------------------------
    const updateFields = {
      members: members,
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
      editorEmails,
      pendingEditorEmails,
      updatedAt: Date.now(),
    };

    // ---------------------------------------------------------
    // 📝 Commit update
    // ---------------------------------------------------------
    await update(familyRef, updateFields);

    successMessageCallback(`✅ Family ${familyIdToSave} updated successfully!`);

    return {
      updatedFields: updateFields,
    };
  } catch (err) {
    console.error("RTDB Update Family Error:", err);
    throw err;
  } finally {
    setLoadingCallback(false);
  }
}

/**
 * ---------------------------------------------------------
 * 🔄 toggleMemberPendingStatus (RTDB version)
 * ---------------------------------------------------------
 */
export async function toggleMemberPendingStatus(
  memberId,
  currentPending,
  profile,
  updateProfile,
  setWarning,
  setLoading,
  setMembers
) {
  if (!profile?.editorEmails || !profile.editorEmails[profile?.currentUserEmail]) {
    // If editorEmails is a map, check permissions correctly
    // If it's array in local profile, fallback to array check
    const hasPermission =
      Array.isArray(profile?.editorEmails)
        ? profile.editorEmails.includes(profile?.currentUserEmail)
        : !!profile.editorEmails[profile?.currentUserEmail];

    if (!hasPermission) {
      setWarning("⚠️ તમે આ સભ્યની સ્થિતિ બદલવાની પરવાનગી નથી.");
      return;
    }
  }

  if (!window.confirm("Change member status?")) return;
  setLoading(true);

  try {
    const familyRef = ref(db, `families/${profile.id}`);
    const snapshot = await get(familyRef);

    if (!snapshot.exists()) {
      setWarning("❌ Family data not found.");
      return;
    }

    const familyData = snapshot.val();
    const updatedMembers = (familyData.members || []).map((m) =>
      m.id === memberId ? { ...m, pending: !currentPending } : m
    );

    // ---------------------------------------------------------
    // 🔄 Update RTDB
    // ---------------------------------------------------------
    await update(familyRef, {
      members: updatedMembers,
      updatedAt: Date.now(),
    });

    // ---------------------------------------------------------
    // 🔄 Update local UI
    // ---------------------------------------------------------
    await updateProfile({
      ...profile,
      members: updatedMembers,
    });

    setMembers(updatedMembers);
    setWarning("✅ Member status updated.");
  } catch (err) {
    console.error("RTDB status toggle error:", err);
    setWarning("⚠️ Update failed.");
  } finally {
    setLoading(false);
  }
}
