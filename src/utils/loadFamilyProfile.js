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

  const cacheKey = "profileData"; // 👈 user-specific suffix is auto-handled by safeLocalForage

  // 1️⃣ Try from local cache first
  const cached = await safeLocalForage.getItem(cacheKey);
  if (cached) {
    console.log("✅ Loaded profile from local cache:", cached);
    const allKeys = await localforage.keys();
    
   console.log("----------------------------------------------------------------");
    console.log("✅ LOCAL CACHE LOADED (on login/return):", cached); // Simpler log
    console.log("----------------------------------------------------------------");

    updateProfile(cached);
    return cached;
  }

  console.log("⚙️ No cache found, trying RTDB...");
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
        const profileData = { id: familySrno, ...familySnap.data() };

        // Save in local cache for next time
        await safeLocalForage.setItem(cacheKey, profileData);

        updateProfile(profileData);
        console.log("✅ Loaded profile from Firestore:", profileData);
        return profileData;
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
