// src/utils/loadFamilyProfile.js

import safeLocalForage from "../utils/safeLocalForage";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

/* -------------------------------------------------------------------
   Remove hidden unicode characters + trim
------------------------------------------------------------------- */
function clean(str) {
  if (!str) return "";
  return str.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

/* -------------------------------------------------------------------
   Detect UID vs email_key
------------------------------------------------------------------- */
function isUID(key) {
  return key.length >= 20 && !key.includes("@");
}

/* -------------------------------------------------------------------
   Convert "email_com" → "email.com"
------------------------------------------------------------------- */
function emailKeyToEmail(key) {
  return clean(key).replace(/_/g, ".");
}

/* -------------------------------------------------------------------
   Normalize editorEmails or pendingEditorEmails
   editorEmails → UIDs
   pendingEditorEmails → emails
------------------------------------------------------------------- */
function normalizeMap(obj) {
  if (!obj || typeof obj !== "object") return [];

  return Object.keys(obj).map((key) => {
    const cleaned = clean(key);
    return isUID(cleaned) ? cleaned : emailKeyToEmail(cleaned);
  });
}

/* -------------------------------------------------------------------
   Normalize full family
------------------------------------------------------------------- */
function normalizeFamily(data) {
  if (!data) return {};

  const normalized = { ...data };

  normalized.editorEmails = normalizeMap(data.editorEmails); // UID list
  normalized.pendingEditorEmails = normalizeMap(data.pendingEditorEmails); // Email list

  if (data.members && typeof data.members === "object") {
    normalized.members = Object.keys(data.members)
      .map((id) => ({
        id,
        ...data.members[id],
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));
  } else {
    normalized.members = [];
  }

  return normalized;
}

/* -------------------------------------------------------------------
   Main Loader: UID based, cached + sanitized
------------------------------------------------------------------- */
export async function loadFamilyProfile(user, updateProfile) {
  if (!user?.uid) return null;

  const uid = clean(user.uid);
  const cacheKey = `profileData_${uid}`;

  console.log("🚀 loadFamilyProfile start uid=", uid);

  /* 1️⃣ Load from cache */
  const cached = await safeLocalForage.getItem(cacheKey);
  const cachedUpdatedAt = cached?.updatedAt || 0;

  console.log("📦 Cached profile:", cached);

  /* 2️⃣ Get familySrno using UID mapping */
  const srnoSnap = await get(ref(db, `users/${uid}/familySrno`));
  const familySrno = srnoSnap.val();

  if (!srnoSnap.exists() || !familySrno) {
    console.warn("⚠ No familySrno found for user:", uid);
    return null;
  }

  /* 3️⃣ Read updatedAt */
  const updatedAtSnap = await get(ref(db, `families/${familySrno}/updatedAt`));
  const serverUpdatedAt = updatedAtSnap.val() || 0;

  /* 4️⃣ Use cache if no change */
  if (cached && cachedUpdatedAt === serverUpdatedAt) {
    console.log("✔ Using cached family profile");
    updateProfile(cached);
    return cached;
  }

  /* 5️⃣ Fetch full family */
  const familySnap = await get(ref(db, `families/${familySrno}`));

  if (!familySnap.exists()) {
    console.warn("⚠ Family not found:", familySrno);
    return null;
  }

  const raw = familySnap.val();

  /* 6️⃣ Normalize + sanitize */
  const normalized = normalizeFamily(raw);

  const finalProfile = {
    id: familySrno,
    updatedAt: raw.updatedAt || Date.now(),
    ...normalized,
  };

  console.log("🔥 Final normalized family:", finalProfile);

  /* 7️⃣ Save to local cache */
  await safeLocalForage.setItem(cacheKey, finalProfile);

  /* 8️⃣ Update React context */
  updateProfile(finalProfile);

  return finalProfile;
}
