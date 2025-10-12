// src/components/CombinedForm/utils/localforageHelpers.js
import localforage from "localforage";

export async function loadLocalProfile(userId) {
  try {
    return await localforage.getItem(`profileData_${userId}`);
  } catch (err) {
    console.error("LocalForage Load Error:", err);
    return null;
  }
}

export async function saveLocalProfile(userId, data) {
  try {
    await localforage.setItem(`profileData_${userId}`, data);
    return true;
  } catch (err) {
    console.error("LocalForage Save Error:", err);
    return false;
  }
}
