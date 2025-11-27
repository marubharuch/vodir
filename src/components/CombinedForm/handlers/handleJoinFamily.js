// src/components/CombinedForm/handlers/handleJoinFamily.js

import { ref, get, update } from "firebase/database";
import { db } from "../../../firebase";

export async function handleJoinFamily(
  srno,
  mobile,
  user,
  setShowJoinPopup,
  setWarning,
  setLoading
) {
  setLoading(true);
  setWarning("");

  try {
    if (!user?.uid || !user?.email) {
      setWarning("❌ User not logged in. Please login again.");
      return;
    }

    const uid = user.uid;
    const safeEmailKey = user.email.replace(/\./g, "_");

    /* -----------------------------------------
       1️⃣ Load family
    ------------------------------------------*/
    const familyRef = ref(db, `families/${srno}`);
    const snap = await get(familyRef);

    if (!snap.exists()) {
      setWarning(`❌ SRNO ${srno} માટે કોઈ ફેમિલી મળી નથી.`);
      return;
    }

    const data = snap.val();

    /* -----------------------------------------
       2️⃣ Check existing pending request (email-based)
    ------------------------------------------*/
    const pending = data.pendingEditorEmails || {};

    if (pending[safeEmailKey]) {
      setWarning("⚠️ તમારી રિક્વેસ્ટ પહેલેથી જ પેન્ડિંગ છે.");
      return;
    }

    /* -----------------------------------------
       3️⃣ Match member by mobile
    ------------------------------------------*/
    const membersObj = data.members || {};
    const memberArray = Object.keys(membersObj).map((id) => ({
      id,
      ...membersObj[id],
    }));

    const matched = memberArray.find(
      (m) => m.mobile?.toString() === mobile.toString()
    );

    if (!matched) {
      setWarning("❌ મોબાઈલ નંબર ફેમિલીમાં મળ્યો નથી.");
      return;
    }

    /* -----------------------------------------
       4️⃣ Add pending request (EMAIL KEY)
    ------------------------------------------*/
    pending[safeEmailKey] = true;

    await update(familyRef, {
      pendingEditorEmails: pending,
      updatedAt: Date.now(),
    });

    /* -----------------------------------------
       5️⃣ ❗ DO NOT SET familySrno YET
       User will get familySrno ONLY after approval
    ------------------------------------------*/

    setWarning("✅ તમારી રિક્વેસ્ટ એડમિનને મોકલાઈ ગઈ!");
    setShowJoinPopup(false);
  } catch (err) {
    console.error("Join Family Error:", err);
    setWarning("⚠️ Family join દરમિયાન ભૂલ થઈ.");
  } finally {
    setLoading(false);
  }
}
