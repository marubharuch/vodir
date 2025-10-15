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
// ProfileContext.jsx

// ... (existing code and imports)

export function ProfileProvider({ children }) {
  const { user, loading } = useAuth(); // 👈 Get the current user
  const [profile, setProfile] = useState(null);

  // useEffect to load data based on the current user
useEffect(() => {
  if (loading) return;
  if (!user) {
    setProfile(null);
    return;
  }

  // 🚀 FIX: Ab yahan sirf loadFamilyProfile ko call kiya jayega.
  // Iske andar ka caching logic hamesha loadFamilyProfile hi manage karega.
  loadFamilyProfile(user, setProfile); 

}, [user, loading]); // Dependencies: user ya loading state change hone par run ho
  
  const updateProfile = async (data) => {
    setProfile(data);
    if (user) {
      // ✅ FIX: Ab safeLocalForage use karein, direct localforage nahi
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

// ... (rest of the code)

export function useProfile() {
  return useContext(ProfileContext);
}