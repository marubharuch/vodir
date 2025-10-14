import localforage from "localforage";
import { auth } from "../firebase";

const getUserId = () => auth.currentUser?.uid || "guest";

// ✅ Internal helper to modify key automatically
const userKey = (key) => `${key}_${getUserId()}`;

// 🧠 PATCH layer – behaves exactly like localforage but adds userId automatically
const safeLocalForage = {
  async getItem(key) {
    // 1️⃣ Try user-specific first
    const value = await localforage.getItem(userKey(key));
    if (value !== null) return value;

    // 2️⃣ Fallback for old shared keys (for backward compatibility)
    const oldValue = await localforage.getItem(key);
    if (oldValue !== null) {
      await localforage.setItem(userKey(key), oldValue);
      await localforage.removeItem(key);
      return oldValue;
    }

    return null;
  },

  async setItem(key, value) {
    return await localforage.setItem(userKey(key), value);
  },

  async removeItem(key) {
    return await localforage.removeItem(userKey(key));
  },

  async clearUserData() {
    const userId = getUserId();
    const keys = await localforage.keys();
    for (const key of keys) {
      if (key.endsWith(`_${userId}`)) {
        await localforage.removeItem(key);
      }
    }
  },

  // Optional: show all user data
  async listUserData() {
    const userId = getUserId();
    const keys = await localforage.keys();
    return keys.filter((k) => k.endsWith(`_${userId}`));
  },
};

export default safeLocalForage;
