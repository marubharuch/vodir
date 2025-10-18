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

  const cacheKey = `profileData_${user.uid}`; // 👈 user-specific suffix is auto-handled by safeLocalForage

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
      //  const `profileData_${user.uid}` = { id: familySrno, ...familySnap.data() };
const newProfileData = { id: familySrno, ...familySnap.data() };

// 2. Define the key string separately (for use in localforage)
const userCacheKey = `profileData_${user.uid}`;

// 3. Now, you use the key string to save the data in localforage:
await localforage.setItem(userCacheKey, newProfileData);
        // Save in local cache for next time
        await safeLocalForage.setItem(cacheKey, `profileData_${user.uid}`);

        updateProfile(`profileData_${user.uid}`);
        console.log("✅ Loaded profile from Firestore:", `profileData_${user.uid}`);
        return `profileData_${user.uid}`;
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