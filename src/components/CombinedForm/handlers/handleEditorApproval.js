// src/components/CombinedForm/handlers/handleEditorApproval.js

import { ref, get, update } from "firebase/database";
import { db } from "../../../firebase";
import localforage from "localforage";

export async function handleEditorApproval(
  targetUid,
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

    /* Permission Check */
    const isEditor =
      Array.isArray(profile.editorEmails) &&
      profile.editorEmails.includes(approverUid);
    if (!isEditor) {
      setWarning("⚠️ તમને મંજૂરી / રદ કરવાની પરવાનગી નથી.");
      return;
    }

    const familyRef = ref(db, `families/${profile.id}`);
    const snap = await get(familyRef);
    if (!snap.exists()) {
      setWarning("⚠️ Family not found in database.");
      return;
    }

    const data = snap.val();
    const editors = data.editorEmails || {};
    const pending = data.pendingEditorEmails || {};

    /* Load user info */
    const usersSnap = await get(ref(db, "users"));
    const allUsers = usersSnap.val() || {};
    const userData = allUsers[targetUid];

    if (!userData) {
      setWarning("⚠ User data not found.");
      return;
    }

    /* Confirm */
    if (
      !window.confirm(
        `${approve ? "Approve" : "Reject"} ${userData.email} (${userData.name})?`
      )
    )
      return;

    if (!pending[targetUid]) {
      setWarning("⚠ No pending request for this user.");
      return;
    }

    let successMsg = "";

    /* APPROVE */
    if (approve) {
      editors[targetUid] = true;
      delete pending[targetUid];

      await update(ref(db, `users/${targetUid}`), {
        familySrno: profile.id,
      });

      successMsg = `✅ ${userData.email} approved.`;
    }
    /* REJECT */
    else {
      delete pending[targetUid];

      await update(ref(db, `users/${targetUid}`), {
        familySrno: null,
      });

      successMsg = `❌ ${userData.email} rejected.`;
    }

    /* Save */
    await update(familyRef, {
      editorEmails: editors,
      pendingEditorEmails: pending,
      updatedAt: Date.now(),
    });

    /* Update UI profile */
    const newProfile = {
      ...profile,
      editorEmails: Object.keys(editors),
      pendingEditorEmails: Object.keys(pending).map(
        (uid) => allUsers[uid]?.email || uid
      ),
      updatedAt: Date.now(),
    };

    await localforage.setItem(`profileData_${user.uid}`, newProfile);
    updateProfile(newProfile);

    setWarning(successMsg);
  } catch (err) {
    console.error("Approval error:", err);
    setWarning("⚠ Approval update failed.");
  } finally {
    setLoading(false);
  }
}
