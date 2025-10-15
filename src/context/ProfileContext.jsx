// src/context/ProfileContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";
import { useAuth } from "./AuthContext"; 
import { loadFamilyProfile } from "../utils/loadFamilyProfile"
import safeLocalForage from "../utils/safeLocalForage"; 

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const { user, loading } = useAuth(); 
  const [profile, setProfile] = useState(null);

  // useEffect to load data based on the current user
useEffect(() => {
  if (loading) return;
  if (!user) {
    // Agar user logged out ho toh profile ko reset karein
    setProfile(null);
    return;
  }

  // 🚀 FIX: Ab yahan sirf loadFamilyProfile ko call kiya jayega.
  loadFamilyProfile(user, setProfile); 

}, [user, loading]); 
  
  const updateProfile = async (data) => {
    setProfile(data);
    if (user) {
      // ✅ FIX: Ab safeLocalForage use karein
      await safeLocalForage.setItem("profileData", data);
    } else {
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