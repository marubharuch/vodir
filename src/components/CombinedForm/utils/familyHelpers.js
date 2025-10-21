// src/components/CombinedForm/utils/familyHelpers.js
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { datastore } from "../../../firebase";

export async function handleUpdateFamily(
  familyIdToSave,
  members,
  currentUserEmail,
  profile,
  formData,
  userIndexRef, // This is unused, but we'll keep it for function signature integrity
  familiesRef,
  successMessageCallback,
  setLoadingCallback
) {
  try {
    // 1. Construct the minimal update payload only with fields that are changing.
    // We explicitly include members, nativeCity, and currentCity.
    const updateFields = {
      members: members,
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
      updatedAt: serverTimestamp(),
      // We explicitly include editorEmails and pendingEditorEmails ONLY IF they
      // have changed, but in this context, we'll assume they are stable
      // or managed elsewhere, and just update the main data points.
      // If we *must* ensure they are in the payload:
      editorEmails: profile.editorEmails || [],
      pendingEditorEmails: profile.pendingEditorEmails || [],
    };
    
    // IMPORTANT: DO NOT include 'createdBy' and 'createdAt' in the update payload.
    // They are static fields and should not be updated. updateDoc will automatically
    // leave them alone if they are not included in the payload.

    await updateDoc(doc(familiesRef, familyIdToSave), updateFields);
    
    successMessageCallback(`✅ Family ${familyIdToSave} updated successfully!`);
    
    // The members and city updates are now correctly included in the Firestore call.
    return { 
        updatedFields: updateFields,
        // For local profile update, you'd want to merge the new data with the old profile
        // but here we just return the fields that were updated in the DB
    }; 
  } catch (err) {
    console.error("Update Family Error:", err);
    throw err;
  } finally {
    // The loading status should be handled by the caller (handleFinish.js)
    // but since the original code had it here, we'll keep it.
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