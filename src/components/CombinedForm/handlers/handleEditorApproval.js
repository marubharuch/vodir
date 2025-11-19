// 🔥 RTDB + Safe Email Version (FINAL FIXED)
import { ref, get, update } from "firebase/database";
import { db } from "../../../firebase";
import localforage from "localforage";

export async function handleEditorApproval(
  email,
  approve,
  profile,
  updateProfile,
  setWarning,
  setLoading,
  user
) {
  const rawUserEmail = user?.email;
  const safeUserEmail = rawUserEmail?.replace(/\./g, "_");

  // Check permission
  const isEditor =
  Array.isArray(profile?.editorEmails) &&
  profile.editorEmails.includes(user.email);

  if (!isEditor) {
    setWarning("⚠️ તમને રિક્વેસ્ટ મંજૂર કે રદ કરવાની પરવાનગી નથી.");
    return;
  }

  if (!window.confirm(`${approve ? "Approve" : "Reject"} ${email}?`)) return;

  setLoading(true);

  try {
    const safeEmail = email.replace(/\./g, "_");

    const familyRef = ref(db, `families/${profile.id}`);
    const snap = await get(familyRef);

    if (!snap.exists()) {
      setWarning("⚠️ Family not found.");
      return;
    }

    const data = snap.val();
    const editors = data.editorEmails || {};
    const pending = data.pendingEditorEmails || {};

    // APPROVE
    if (approve) {
      editors[safeEmail] = true;
      delete pending[safeEmail];
      setWarning(`✅ ${email} approved.`);
    }

    // REJECT
    else {
      delete pending[safeEmail];
      setWarning(`❌ ${email} rejected.`);

      // ❗ FIXED: Remove familySrno using UID, not email
      const targetUid = data?.memberUserIds?.[safeEmail]; // optional mapping
      if (targetUid) {
        await update(ref(db, `users/${targetUid}`), {
          familySrno: null,
        });
      }
    }

    // Save back to RTDB
    await update(familyRef, {
      editorEmails: editors,
      pendingEditorEmails: pending,
      updatedAt: Date.now(),
    });

    // Normalize for UI
    const normalizedEditors = Object.keys(editors).map((k) =>
      k.replace(/_/g, ".")
    );
    const normalizedPending = Object.keys(pending).map((k) =>
      k.replace(/_/g, ".")
    );

    const updatedProfile = {
      ...profile,
      editorEmails: normalizedEditors,
      pendingEditorEmails: normalizedPending,
      updatedAt: Date.now(),
    };

    // Save in LocalForage
    await localforage.setItem(
      `profileData_${user.uid}`,
      updatedProfile
    );

    // Update UI
    updateProfile(updatedProfile);
  } catch (err) {
    console.error("Approval error:", err);
    setWarning("⚠️ Failed to update approval.");
  } finally {
    setLoading(false);
  }
}
