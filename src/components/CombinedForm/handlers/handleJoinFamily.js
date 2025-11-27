// src/components/CombinedForm/handlers/handleJoinFamily.js

import { ref, get, update } from "firebase/database";
import { db } from "../../../firebase";

export async function handleJoinFamily(
  srno,
  mobile,
  user,
  setShowJoinPopup,
  setWarning,
  setLoading,
  profile,
  updateProfile
) {
  setLoading(true);
  setWarning("");

  try {
    if (!user?.uid || !user?.email) {
      setWarning("❌ User not logged in. Please login again.");
      return;
    }

    const uid = user.uid;

    /* 1️⃣ Load family */
    const familyRef = ref(db, `families/${srno}`);
    const snap = await get(familyRef);
    if (!snap.exists()) {
      setWarning(`❌ SRNO ${srno} માટે કોઈ ફેમિલી મળી નથી.`);
      return;
    }
    const data = snap.val();

    /* 2️⃣ Check existing pending */
    const pending = data.pendingEditorEmails || {};
    if (pending[uid]) {
      setWarning("⚠️ તમારી રિક્વેસ્ટ પહેલેથી જ પેન્ડિંગ છે.");
      return;
    }

    /* 3️⃣ Match by mobile */
    const members = data.members || {};
    const matched = Object.values(members).find(
      (m) => m.mobile?.toString() === mobile.toString()
    );
    if (!matched) {
      setWarning("❌ મોબાઈલ નંબર ફેમિલીમાં મળ્યો નથી.");
      return;
    }

    /* 4️⃣ Add pending UID */
    pending[uid] = true;
    await update(familyRef, {
      pendingEditorEmails: pending,
      updatedAt: Date.now(),
    });

    /* 5️⃣ REFRESH DATA FOR UI */
    const updatedSnap = await get(familyRef);
    const updatedData = updatedSnap.val();

    const usersSnap = await get(ref(db, "users"));
    const allUsers = usersSnap.val() || {};

    const pendingList = Object.keys(updatedData.pendingEditorEmails || {}).map(
      (pendingUid) => ({
        uid: pendingUid,
        email: allUsers[pendingUid]?.email || "unknown",
        name: allUsers[pendingUid]?.name || "",
        mobile: allUsers[pendingUid]?.mobile || "",
      })
    );

    /* 6️⃣ Update context */
    updateProfile({
      ...profile,
      pendingEditorEmails: pendingList,
    });

    /* 7️⃣ Notify */
    setWarning("✅ તમારી રિક્વેસ્ટ એડમિનને મોકલાઈ ગઈ!");
    setShowJoinPopup(false);
  } catch (err) {
    console.error("Join Family Error:", err);
    setWarning("⚠️ Family join દરમિયાન ભૂલ થઈ.");
  } finally {
    setLoading(false);
  }
}
