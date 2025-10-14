// src/components/CombinedForm/handlers/enterEditMode.js
import { doc, getDoc } from "firebase/firestore";
import { datastore } from "../../../firebase";

export async function enterEditMode(
  profile,
  user,
  updateProfile,
  setMembers,
  setFormData,
  setWarning,
  setLoading,
  setSelectedMode,
  setIsEditing
) {
  try {
    setLoading(true);
    setWarning(null);

    if (!profile?.id) {
      setWarning("⚠️ Family ID missing. Please reload the page.");
      setLoading(false);
      return;
    }

    // ✅ Fetch full profile data from Firestore
    const familyRef = doc(datastore, "families", profile.id);
    const snapshot = await getDoc(familyRef);

    if (!snapshot.exists()) {
      setWarning("⚠️ Family data not found in database.");
      setLoading(false);
      return;
    }

    const data = snapshot.data();

    // ✅ Update profile state in parent
    updateProfile({ ...profile, ...data });

    // ✅ Update CityInput form fields
    setFormData({
      currentCity: data.currentCity || "",
      nativeCity: data.nativeCity || "",
      area: data.area || "",
      society: data.society || "",
      building: data.building || "",
      address: data.address || "",
      pinCode: data.pinCode || "",
    });

    // ✅ Update members (for MemberForm)
    const fetchedMembers = Array.isArray(data.members) ? data.members : [];
    setMembers(fetchedMembers);

    // ✅ Trigger edit mode (this ensures both forms show)
    setSelectedMode("edit");
    setIsEditing(true);

    console.log("✅ Edit mode activated with family data:", {
      formData: data,
      members: fetchedMembers,
    });
  } catch (error) {
    console.error("❌ Error entering edit mode:", error);
    setWarning("Database read failed. Please try again.");
  } finally {
    setLoading(false);
  }
}