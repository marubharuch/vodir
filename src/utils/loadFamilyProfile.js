// src/utils/loadFamilyProfile.js

import safeLocalForage from "../utils/safeLocalForage";
import { ref, get } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { db, datastore } from "../firebase";
import localforage from "localforage";
/**
 * Loads family profile for a logged-in user
 * Checks in this order: local cache → RTDB → Firestore
 */
export async function loadFamilyProfile(user, updateProfile) {
  if (!user?.uid) return null;

  // We use a simple base key. safeLocalForage will handle the user-specific suffix.
  const cacheKey = "profileData";

  // 1️⃣ Try from local cache first
  const cached = await safeLocalForage.getItem(cacheKey);
  if (cached) {
    // 🚀 CLEANUP: Redundant logs ko hata kar sirf ek detailed debug log rakhein
    try {
        const allKeys = await localforage.keys();
        
        console.log("----------------------------------------------------------------");
        console.log("✅ LOCAL CACHE LOADED (on login/return):");
        console.log("   - Active Profile Data:", cached);
        // User-specific keys showing the debug data
        console.log("   - All LocalForage Keys (User-specific):", allKeys.filter(k => k.endsWith(`_${user.uid}`))); 
        console.log("----------------------------------------------------------------");
    } catch (e) {
        // Fallback agar keys() function mein koi error aaye
        console.log("✅ LOCAL CACHE LOADED, but key listing failed:", cached);
    }

    updateProfile(cached);
    return cached;
  }

  // ⚙️ No cache found, trying RTDB... (Line 29)
  

  console.log(user?.uid,"⚙️ No cache found, trying RTDB...");
  try {
    // 2️⃣ Try Realtime Database for familySrno
    const srnoRef = ref(db, `users/${user.uid}/familySrno`);
    const srnoSnap = await get(srnoRef);

    if (srnoSnap.exists()) {
      const familySrno = srnoSnap.val();
      console.log("Found familySrno in RTDB:", familySrno);

      // 3️⃣ Fetch family data from Firestore
      const familyRef = doc(datastore, "families", familySrno.toString());
      const familySnap = await getDoc(familyRef);

      if (familySnap.exists()) {
        const newProfileData = { id: familySrno, ...familySnap.data() };

        // 🟢 CORRECTED LOGIC: 
        // 1. Use safeLocalForage for user isolation and migration.
        // 2. Save the actual data object (newProfileData), not a key string.
        await safeLocalForage.setItem(cacheKey, newProfileData);

        // It's generally better to update the state with the actual object, not the key string.
        updateProfile(newProfileData);
        console.log("✅ Loaded profile from Firestore and Cached:", newProfileData);

        return newProfileData;
      } else {
        console.warn("⚠️ No family found in Firestore for:", familySrno);
      }
    } else {
      console.warn("⚠️ No familySrno found in RTDB for user:", user.uid);
    }
  } catch (err) {
    console.error("❌ Error loading profile:", err);
  }

  return null;
}