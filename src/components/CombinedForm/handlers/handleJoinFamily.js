// src/components/CombinedForm/handlers/handleJoinFamily.js
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { datastore, db } from "../../../firebase";

export async function handleJoinFamily(srno, mobile, user, setWarning, setLoading) {
  setLoading(true);
  setWarning("");

  try {
    const familyRef = doc(datastore, "families", srno.toString());
    const familySnap = await getDoc(familyRef);
    if (!familySnap.exists()) {
      setWarning(`❌ SRNO ${srno} માટે કોઈ ફેમિલી મળી નથી.`);
      return;
    }

    const familyData = familySnap.data();
    const matchedMember = familyData.members?.find((m) => m.mobile === mobile);
    if (!matchedMember) {
      setWarning("❌ દાખલ કરેલો મોબાઈલ નંબર આ ફેમિલીમાં મળ્યો નથી.");
      return;
    }

    const updatedPending = [...(familyData.pendingEditorEmails || []), user.email];
    await updateDoc(familyRef, { pendingEditorEmails: updatedPending, updatedAt: serverTimestamp() });
    await set(ref(db, `users/${user.uid}/familySrno`), srno.toString());

    setWarning("✅ તમારી એડિટર રિક્વેસ્ટ મોકલાઈ ગઈ છે!");
  } catch (err) {
    console.error("Join Family Error:", err);
    setWarning("⚠️ Family join દરમ્યાન ભૂલ થઈ.");
  } finally {
    setLoading(false);
  }
}
