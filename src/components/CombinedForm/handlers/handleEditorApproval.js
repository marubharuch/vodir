// src/components/CombinedForm/handlers/handleEditorApproval.js

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
  try {
    setLoading(true);

    if (!profile?.id) {
      setWarning("⚠️ Family not found.");
      return;
    }

    const approverUid = user.uid;

    // 1️⃣ Check permission (editorEmails contains UIDs)
    const isEditor =
      Array.isArray(profile.editorEmails) &&
      profile.editorEmails.includes(approverUid);

    if (!isEditor) {
      setWarning("⚠️ તમને મંજૂરી / રદ કરવાની પરવાનગી નથી.");
      return;
    }

    if (!window.confirm(`${approve ? "Approve" : "Reject"} ${email}?`)) return;

    const emailKey = email.replace(/\./g, "_");
    const familyRef = ref(db, `families/${profile.id}`);
    const snap = await get(familyRef);

    if (!snap.exists()) {
      setWarning("⚠️ Family not found in database.");
      return;
    }

    const data = snap.val();
    const editors = data.editorEmails || {};  // UID keys
    const pending = data.pendingEditorEmails || {}; // email_key keys


    /* --------------------------------------------------------------------
       2️⃣ Find UID of this email (MUST WORK TO APPROVE CORRECT USER)
    -------------------------------------------------------------------- */
    const usersRef = ref(db, "users");
    const allUsers = (await get(usersRef)).val() || {};

    let targetUid = null;

    // find which UID belongs to this email
    Object.keys(allUsers).forEach((uid) => {
      if (allUsers[uid].email === email) {
        targetUid = uid;
      }
    });

    if (!targetUid) {
      setWarning("⚠️ User not found for this email.");
      delete pending[emailKey]; // clean inconsistent entry
      return;
    }


    let successMsg = "";


    /* --------------------------------------------------------------------
       3️⃣ APPROVE
    -------------------------------------------------------------------- */
    if (approve) {
      // Add UID as editor
      editors[targetUid] = true;

      // Remove from pending
      delete pending[emailKey];

      // Link user to family
      await update(ref(db, `users/${targetUid}`), {
        familySrno: profile.id,
      });

      successMsg = `✅ ${email} approved as editor.`;
    }


    /* --------------------------------------------------------------------
       4️⃣ REJECT
    -------------------------------------------------------------------- */
    else {
      delete pending[emailKey];

      // Unlink only if they previously linked themselves before approval
      await update(ref(db, `users/${targetUid}`), {
        familySrno: null,
      });

      successMsg = `❌ ${email} rejected.`;
    }


    /* --------------------------------------------------------------------
       5️⃣ SAVE BACK TO RTDB
    -------------------------------------------------------------------- */
    await update(familyRef, {
      editorEmails: editors,
      pendingEditorEmails: pending,
      updatedAt: Date.now(),
    });


    /* --------------------------------------------------------------------
       6️⃣ NORMALIZE FOR UI
           editorEmails → UID array
           pending → real emails array
    -------------------------------------------------------------------- */
    const normalizedEditors = Object.keys(editors); // ONLY UIDs
    const normalizedPending = Object.keys(pending).map((k) =>
      k.replace(/_/g, ".")
    );


    const updatedProfile = {
      ...profile,
      editorEmails: normalizedEditors,
      pendingEditorEmails: normalizedPending,
      updatedAt: Date.now(),
    };


    // Update Local Cache
    await localforage.setItem(`profileData_${user.uid}`, updatedProfile);

    // Update React Context
    updateProfile(updatedProfile);

    setWarning(successMsg);
  } catch (err) {
    console.error("Approval error:", err);
    setWarning("⚠️ Approval update failed.");
  } finally {
    setLoading(false);
  }
}
