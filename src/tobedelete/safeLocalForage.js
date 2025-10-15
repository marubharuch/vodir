import localforage from "localforage";
import { auth } from "../firebase";

/**
 * Get current userId safely.
 * Firebase may not have restored auth yet during first page load,
 * so we handle that gracefully.
 */
const getUserId = () => {
  const uid = auth?.currentUser?.uid;
  return uid ? uid : "guest";
};

/**
 * Generate per-user key (adds suffix automatically)
 */
const userKey = (key, uid = getUserId()) => `${key}_${uid}`;

/**
 * 🧠 safeLocalForage wrapper
 * Works just like localforage but ensures all data is stored per-user.
 * Also migrates old un-suffixed keys automatically.
 */
const safeLocalForage = {
  async getItem(key) {
    const uid = getUserId();

    // Wait for localforage readiness
    await localforage.ready();

    // 1️⃣ Try user-specific key first
    const userSpecificKey = userKey(key, uid);
    const value = await localforage.getItem(userSpecificKey);
    if (value !== null) return value;

    // 2️⃣ Fallback: try legacy (no-suffix) key for migration
    const oldValue = await localforage.getItem(key);
    if (oldValue !== null) {
      await localforage.setItem(userSpecificKey, oldValue);
      await localforage.removeItem(key);
      return oldValue;
    }

    return null;
  },

  async setItem(key, value) {
    await localforage.ready();
    const uid = getUserId();
    return await localforage.setItem(userKey(key, uid), value);
  },

  async removeItem(key) {
    await localforage.ready();
    const uid = getUserId();
    return await localforage.removeItem(userKey(key, uid));
  },

  /**
   * 🧹 Clear all cached data for current user
   */
  async clearUserData() {
    await localforage.ready();
    const uid = getUserId();
    const keys = await localforage.keys();

    for (const key of keys) {
      if (key.endsWith(`_${uid}`)) {
        await localforage.removeItem(key);
      }
    }
  },

  /**
   * 📋 List all keys belonging to the current user
   */
  async listUserData() {
    await localforage.ready();
    const uid = getUserId();
    const keys = await localforage.keys();
    return keys.filter((k) => k.endsWith(`_${uid}`));
  },

  /**
   * 🪄 Helper for debugging – returns actual key name
   */
  resolveKey(key) {
    return userKey(key);
  },
};

export default safeLocalForage;
