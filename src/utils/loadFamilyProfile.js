// 🚀 Corrected RTDB-ONLY VERSION
// src/utils/loadFamilyProfile.js

import safeLocalForage from "../utils/safeLocalForage";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

// 👉 Normalize RTDB data to UI-friendly format
function normalizeFamilyData(data) {
  const normalized = { ...data };

  // Normalize editorEmails (object -> array)
  if (normalized.editorEmails && typeof normalized.editorEmails === "object") {
    normalized.editorEmails = Object.keys(normalized.editorEmails).map((k) =>
      k.replace(/_/g, ".")
    );
  }

  // Normalize pendingEditorEmails (object -> array)
  if (
    normalized.pendingEditorEmails &&
    typeof normalized.pendingEditorEmails === "object"
  ) {
    normalized.pendingEditorEmails = Object.keys(
      normalized.pendingEditorEmails
    ).map((k) => k.replace(/_/g, "."));
  }

  // Normalize members (object -> array)
  if (
    normalized.members &&
    !Array.isArray(normalized.members) &&
    typeof normalized.members === "object"
  ) {
    normalized.members = Object.keys(normalized.members)
      .map((key) => ({ id: key, ...normalized.members[key] }))
      .sort((a, b) => Number(a.id) - Number(b.id));
  }

  return normalized;
}

/**
 * Loads family profile for a logged-in user
 */
export async function loadFamilyProfile(user, updateProfile) {
  if (!user?.uid) return null;

  console.log("load family profile (RTDB)");

  const cacheKey = `profileData_${user.uid}`;
  console.log("🔑 LocalForage Key:", cacheKey);

  // 1️⃣ Load from LocalForage
  const cached = await safeLocalForage.getItem(cacheKey);
  console.log("📦 LocalForage Cached Data:", JSON.stringify(cached, null, 2));

  if (cached) {
    const normalizedCache = normalizeFamilyData(cached);
    console.log("📦 Normalized Cache:", JSON.stringify(normalizedCache, null, 2));

    updateProfile(normalizedCache);
    return normalizedCache;
  }

  // 2️⃣ Load familySrno from RTDB

  const userKey = user.email.replace(/\./g, "_");
const srnoSnap = await get(ref(db, `users/${userKey}/familySrno`));                                                 
  console.log("🔥 RTDB familySrno snapshot:", srnoSnap.val());

  if (!srnoSnap.exists()) return null;

  const familySrno = srnoSnap.val();

  // 3️⃣ Load full family data from RTDB
  const familySnap = await get(ref(db, `families/${familySrno}`));
  console.log("🔥 RTDB family data raw:", JSON.stringify(familySnap.val(), null, 2));

  if (!familySnap.exists()) return null;

  const familyData = familySnap.val();

  // Normalize
  const newProfileData = {
    id: familySrno,
    ...normalizeFamilyData(familyData),
  };

  console.log("🔥 RTDB normalized data:", JSON.stringify(newProfileData, null, 2));

  // Save to LocalForage
  await safeLocalForage.setItem(cacheKey, newProfileData);
  console.log("💾 Saved to LocalForage");

  updateProfile(newProfileData);
  return newProfileData;
}
