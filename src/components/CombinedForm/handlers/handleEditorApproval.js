// ✅ FIXED: src/components/CombinedForm/handlers/handleEditorApproval.js
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { datastore } from "../../../firebase";

/**
 * Handles approving or rejecting editor requests
 * @param {string} email - Email of the pending editor
 * @param {boolean} approve - true=approve, false=reject
 * @param {object} profile - Current family profile
 * @param {function} updateProfile - Function to update local profile
 * @param {function} setWarning - Function to set warning message
 * @param {function} setLoading - Function to toggle loading spinner
 * @param {object} user - Currently logged-in Firebase user
 */
export async function handleEditorApproval(
  email,
  approve,
  profile,
  updateProfile,
  setWarning,
  setLoading,
  user
) {
  // ✅ Check: only current editors can approve/reject
  const isCurrentUserEditor = profile?.editorEmails?.includes(user?.email);

  if (!isCurrentUserEditor) {
    setWarning("⚠️ તમને રિક્વેસ્ટ મંજૂર કે રદ કરવાની પરવાનગી નથી.");
    return;
  }

  if (
    !window.confirm(
      `${approve ? "✅ Approve" : "❌ Reject"} request from ${email}?`
    )
  )
    return;

  setLoading(true);
  try {
    const familiesRef = doc(datastore, "families", profile.id);

    // Clone current arrays safely
    let updatedEditors = [...(profile.editorEmails || [])];
    let updatedPending = [...(profile.pendingEditorEmails || [])];

    if (approve) {
      // Add to editor list only if not already added
      if (!updatedEditors.includes(email)) {
        updatedEditors.push(email);
      }
      updatedPending = updatedPending.filter((e) => e !== email);
      setWarning(`✅ ${email} approved.`);
    } else {
      // Reject: remove from pending
      updatedPending = updatedPending.filter((e) => e !== email);
      setWarning(`❌ ${email} rejected.`);

      // Optional: unlink user in Firestore "users" collection
      const userRef = doc(datastore, "users", email);
      await updateDoc(userRef, { familySrno: null }).catch(() => {});
    }

    // Update Firestore family document
    await updateDoc(familiesRef, {
      editorEmails: updatedEditors,
      pendingEditorEmails: updatedPending,
      updatedAt: serverTimestamp(),
    });

    // Update local profile in memory
    await updateProfile({
      ...profile,
      editorEmails: updatedEditors,
      pendingEditorEmails: updatedPending,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error("Approval error:", err);
    setWarning("⚠️ Failed to update approval.");
  } finally {
    setLoading(false);
  }
}
