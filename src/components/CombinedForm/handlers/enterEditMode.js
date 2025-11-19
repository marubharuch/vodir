// 🔥 RTDB-ONLY VERSION
// src/components/CombinedForm/handlers/enterEditMode.js

import { ref, get } from "firebase/database";
import { db } from "../../../firebase";

export async function enterEditMode(
  profile,
  user,
  updateProfile,
  setMembers,
  setFormData,
  setWarning,
  setLoading,
  setSelectedMode,
  setIsFinalView,
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

    // ------------------------------------------------------
    // 🔍 Fetch family data from Realtime Database
    // ------------------------------------------------------
    const familyRef = ref(db, `families/${profile.id}`);
    const snapshot = await get(familyRef);

    if (!snapshot.exists()) {
      setWarning("⚠️ Family data not found.");
      setLoading(false);
      return;
    }

    const data = snapshot.val();

    // ------------------------------------------------------
    // 🔄 Update profile (merge with existing)
    // ------------------------------------------------------
    updateProfile({ ...profile, ...data });

    // ------------------------------------------------------
    // 🏙 Update form fields (CityInput)
    // ------------------------------------------------------
    setFormData({
      currentCity: data.currentCity || "",
      nativeCity: data.nativeCity || "",
      area: data.area || "",
      society: data.society || "",
      building: data.building || "",
      address: data.address || "",
      pinCode: data.pinCode || "",
    });

    // ------------------------------------------------------
    // 👥 Update Member List
    // ------------------------------------------------------
    const fetchedMembers = Array.isArray(data.members) ? data.members : [];
    setMembers(fetchedMembers);

    // ------------------------------------------------------
    // ✏️ Activate Edit Mode
    // ------------------------------------------------------
    setSelectedMode("edit");
    setIsEditing(true);
    setIsFinalView(true);

    console.log("✅ Edit mode activated (RTDB):", {
      formData: data,
      members: fetchedMembers,
    });

  } catch (error) {
    console.error("❌ RTDB Error entering edit mode:", error);
    setWarning("Database read failed. Please try again.");
  } finally {
    setLoading(false);
  }
}
