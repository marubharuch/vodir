// RTDB Version - src/components/CombinedForm/handlers/handleEditorApproval.js

import { ref, update, get } from "firebase/database";
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
  if (!profile?.id) return;

  const safeUserEmail = user.email.replace(/\./g, "_");
  const safeEmail = email.replace(/\./g, "_");

  // ⚠️ Only current approved editors can approve requests
  const isCurrentUserEditor =
    profile.editorEmails?.[safeUserEmail] === true;

  if (!isCurrentUserEditor) {
    setWarning("⚠️ તમને રિક્વેસ્ટ મંજૂર કે રદ કરવાની પરવાનગી નથી.");
    return;
  }

  if (
    !window.confirm(
      `${approve ? "✔️ Approve" : "❌ Reject"} request from ${email}?`
    )
  )
    return;

  setLoading(true);

  try {
    const famRef = ref(db, `families/${profile.id}`);

    // 1️⃣ Fetch latest family data
    const snap = await get(famRef);
    const data = snap.val() || {};

    const editorEmails = data.editorEmails || {};
    const pendingEditorEmails = data.pendingEditorEmails || {};

    // 2️⃣ Approve logic
    if (approve) {
      editorEmails[safeEmail] = true;
      delete pendingEditorEmails[safeEmail];
      setWarning(`✔️ ${email} approved as editor.`);
    }

    // 3️⃣ Reject logic
    else {
      delete pendingEditorEmails[safeEmail];
      setWarning(`❌ ${email} request rejected.`);
    }

    // 4️⃣ Save to RTDB
    await update(famRef, {
      editorEmails,
      pendingEditorEmails,
      updatedAt: Date.now(),
    });

    // 5️⃣ Update LocalForage
    const cacheKey = `profileData_${user.uid}`;
    const updatedProfile = {
      ...profile,
      editorEmails,
      pendingEditorEmails,
      updatedAt: Date.now(),
    };

    await localforage.setItem(cacheKey, updatedProfile);

    // 6️⃣ Update React State
    updateProfile(updatedProfile);
  } catch (err) {
    console.error("Approval Error:", err);
    setWarning("⚠️ Approval failed.");
  } finally {
    setLoading(false);
  }
}
