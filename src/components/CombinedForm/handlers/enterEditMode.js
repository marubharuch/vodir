// src/components/CombinedForm/handlers/enterEditMode.js
import { doc, getDoc } from "firebase/firestore";
import { datastore } from "../../../firebase";

export async function enterEditMode(profile, user, updateProfile, setMembers, setFormData, setWarning, setLoading) {
  if (!profile?.editorEmails?.includes(user?.email)) {
    setWarning("❌ તમને આ ફેમિલી એડિટ કરવાની પરવાનગી નથી.");
    return;
  }
console.log("enter edit mode")
  setLoading(true);
  setWarning("");

  try {
    const familyDocRef = doc(datastore, "families", profile.id);
    const familySnap = await getDoc(familyDocRef);

    if (familySnap.exists()) {
      const familyData = { id: familySnap.id, ...familySnap.data() };
      const time = Date.now();

      await updateProfile({ ...familyData, lastUpdateTimestamp: time });
      setMembers(familyData.members || []);
      setFormData((s) => ({
        ...s,
        nativeCity: familyData.nativeCity || "",
        currentCity: familyData.currentCity || "",
      }));

      setWarning("✅ Data refreshed. You are now in EDIT mode.");
    } else {
      setWarning("⚠️ Family data not found in Firestore.");
    }
  } catch (err) {
    console.error("Edit mode error:", err);
    setWarning("⚠️ Failed to refresh data.");
  } finally {
    setLoading(false);
  }
}
