// src/components/CombinedForm/handlers/handleJoinFamily.js
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { datastore, db } from "../../../firebase";

// 💡 FIX: Add 'setShowJoinPopup' to the list of function parameters.
export async function handleJoinFamily(srno, mobile, user, setShowJoinPopup, setWarning, setLoading) {
  setLoading(true);
  setWarning("");
const userEmail = user.email; // Use 'const' or 'let' to define it
  try {
    const familyRef = doc(datastore, "families", srno.toString());
    const familySnap = await getDoc(familyRef);
    if (!familySnap.exists()) {
      setWarning(`❌ SRNO ${srno} માટે કોઈ ફેમિલી મળી નથી.`);
      return; // 🛑 STOP HERE: Don't close popup or continue on error
    }

    const familyData = familySnap.data();
    if (familyData.pendingEditorEmails?.includes(userEmail)) {
        setWarning("⚠️ તમારી એડિટર રિક્વેસ્ટ પહેલેથી જ મોકલેલી છે અને પેન્ડિંગ છે.");
        return; // Exit if a pending request already exists
    }
    const matchedMember = familyData.members?.find((m) => m.mobile === mobile);
    if (!matchedMember) {
      setWarning("❌ દાખલ કરેલો મોબાઈલ નંબર આ ફેમિલીમાં મળ્યો નથી.");
      return; // 🛑 STOP HERE: Don't close popup or continue on error
    }

    const updatedPending = [...(familyData.pendingEditorEmails || []), user.email];
    await updateDoc(familyRef, { pendingEditorEmails: updatedPending, updatedAt: serverTimestamp() });
    await set(ref(db, `users/${user.uid}/familySrno`), srno.toString());

    setWarning("✅ તમારી એડિટર રિક્વેસ્ટ મોકલાઈ ગઈ છે!");
    
    // ✅ SUCCESS: Close the popup ONLY on success
    setShowJoinPopup(false); 

  } catch (err) {
    console.error("Join Family Error:", err);
    setWarning("⚠️ Family join દરમ્યાન ભૂલ થઈ.");
  } finally {
    setLoading(false);
  }
}