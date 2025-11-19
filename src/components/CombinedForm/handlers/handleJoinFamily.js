// 🔥 RTDB + Safe Email Version (Fully Corrected)
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
    const rawEmail = user.email;
    const safeEmail = rawEmail.replace(/\./g, "_");

    const familyRef = ref(db, `families/${srno}`);
    const familySnap = await get(familyRef);

    if (!familySnap.exists()) {
      setWarning(`❌ SRNO ${srno} માટે કોઈ ફેમિલી મળી નથી.`);
      return;
    }

    const familyData = familySnap.val();

    // Check existing pending request
    const pendingMap = familyData.pendingEditorEmails || {};
    if (pendingMap[safeEmail]) {
      setWarning("⚠️ તમારી એડિટર રિક્વેસ્ટ પહેલેથી જ પેન્ડિંગ છે.");
      return;
    }

    // Convert members object -> array (FIXED)
    const membersObj = familyData.members || {};
    const memberArray = Object.keys(membersObj).map((id) => ({
      id,
      ...membersObj[id],
    }));

    // Match mobile inside members (FIXED)
    const matched = memberArray.find(
      (m) => m.mobile?.toString() === mobile.toString()
    );

    if (!matched) {
      setWarning("❌ દાખલ કરેલો મોબાઈલ નંબર આ ફેમિલીમાં મળ્યો નથી.");
      return;
    }

    // Add pending editor request
    const updatedPending = {
      ...pendingMap,
      [safeEmail]: true,
    };

    await update(familyRef, {
      pendingEditorEmails: updatedPending,
      updatedAt: Date.now(),
    });

    // FIXED: Link UID, not email
    await update(ref(db, `users/${user.uid}`), {
      familySrno: srno.toString(),
    });

    setWarning("✅ તમારી રિક્વેસ્ટ મોકલાઈ ગઈ!");
    setShowJoinPopup(false);

  } catch (err) {
    console.error("Join Family Error:", err);
    setWarning("⚠️ Family join દરમ્યાન ભૂલ થઈ.");
  } finally {
    setLoading(false);
  }
}
