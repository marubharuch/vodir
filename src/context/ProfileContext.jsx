// src/context/ProfileContext.jsx
// Yeh file ProfileContext banati hai jismein hum user ka profile data store karte hain.
// ... (rest of the comments)

import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";
import { useAuth } from "./AuthContext"; 
import { loadFamilyProfile } from "../utils/loadFamilyProfile"
// ✅ ADD THIS LINE: safeLocalForage ki zaroorat updateProfile mein padegi
import safeLocalForage from "../utils/safeLocalForage"; 

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const { user, loading } = useAuth(); 
  const [profile, setProfile] = useState(null);

  // useEffect to load data based on the current user
useEffect(() => {
  if (loading) return;
  if (!user) {
    setProfile(null);
    return;
  }

  // 🚀 FIX: Redundant Caching Logic ko hata diya gaya hai.
  // Ab sirf loadFamilyProfile ko call kiya jaayega.
  loadFamilyProfile(user, setProfile); 

}, [user, loading]);

  const updateProfile = async (data) => {
    setProfile(data);
    if (user) {
      // ✅ FIX: Data ko safeLocalForage ke through save karein
      await safeLocalForage.setItem("profileData", data);
    } else {
      // ✅ FIX: Logout/no user par data clear karein
      await safeLocalForage.removeItem("profileData");
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}