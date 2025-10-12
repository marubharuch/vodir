// src/components/CombinedForm/utils/familyHelpers.js
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { datastore } from "../../../firebase";

export async function handleUpdateFamily(
  familyIdToSave,
  members,
  currentUserEmail,
  profile,
  formData,
  userIndexRef,
  familiesRef,
  successMessageCallback,
  setLoadingCallback
) {
  try {
    const finalPayload = {
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
      members,
      updatedAt: serverTimestamp(),
      editorEmails: profile.editorEmails || [],
      pendingEditorEmails: profile.pendingEditorEmails || [],
      createdBy: profile.createdBy,
      createdAt: profile.createdAt,
    };

    await updateDoc(doc(familiesRef, familyIdToSave), finalPayload);
    successMessageCallback(`✅ Family ${familyIdToSave} updated successfully!`);
    return { finalFamilyPayload: finalPayload };
  } catch (err) {
    console.error("Update Family Error:", err);
    throw err;
  } finally {
    setLoadingCallback(false);
  }
}

export async function toggleMemberPendingStatus(
  memberId,
  currentPending,
  profile,
  updateProfile,
  setWarning,
  setLoading,
  setMembers
) {
  if (!profile?.editorEmails?.length) {
    setWarning("⚠️ તમે આ સભ્યની સ્થિતિ બદલવાની પરવાનગી નથી.");
    return;
  }

  if (!window.confirm("Change member status?")) return;
  setLoading(true);

  try {
    const updatedMembers = profile.members.map((m) =>
      m.id === memberId ? { ...m, pending: !currentPending } : m
    );

    await updateDoc(doc(datastore, "families", profile.id), {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });

    await updateProfile({ ...profile, members: updatedMembers });
    setMembers(updatedMembers);
    setWarning("✅ Member status updated.");
  } catch (err) {
    console.error("Status toggle error:", err);
    setWarning("⚠️ Update failed.");
  } finally {
    setLoading(false);
  }
}
