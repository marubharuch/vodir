// src/components/CombinedForm/handlers/handleEditorApproval.js
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { datastore } from "../../../firebase";

export async function handleEditorApproval(email, approve, profile, updateProfile, setWarning, setLoading) {
  const isApprovedEditor = profile?.editorEmails?.length && profile.editorEmails.includes(email);
  if (!isApprovedEditor && !approve) {
    setWarning("⚠️ તમને રિક્વેસ્ટ રદ કરવાની પરવાનગી નથી.");
    return;
  }

  if (!window.confirm(`Do you want to ${approve ? "APPROVE" : "REJECT"} ${email}?`)) return;

  setLoading(true);
  try {
    const familiesRef = doc(datastore, "families", profile.id);
    let updatedEditors = [...(profile.editorEmails || [])];
    let updatedPending = [...(profile.pendingEditorEmails || [])];

    if (approve) {
      updatedEditors.push(email);
      updatedPending = updatedPending.filter((e) => e !== email);
      setWarning(`✅ ${email} approved.`);
    } else {
      updatedPending = updatedPending.filter((e) => e !== email);
      setWarning(`❌ ${email} rejected.`);
    }

    await updateDoc(familiesRef, {
      editorEmails: updatedEditors,
      pendingEditorEmails: updatedPending,
      updatedAt: serverTimestamp(),
    });

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
