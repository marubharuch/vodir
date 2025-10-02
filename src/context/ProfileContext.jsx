// Yeh file ProfileContext banati hai jismein hum user ka profile data store karte hain.
// Isme React ka context API + localforage use karke data ko local storage jaisa persist karte hain.
// Summary: 
// - Profile data ko ek global state ki tarah manage karna  
// - App reload hone par bhi profile save rehna (localforage ke through)  
// - Profile update aur read karne ke liye context expose karna  

import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";
import { useAuth } from "./AuthContext"; // 👈 Assuming you have an AuthContext

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const { user, loading } = useAuth(); // 👈 Get the current user
  const [profile, setProfile] = useState(null);

  // useEffect to load data based on the current user
  useEffect(() => {
    // Only proceed if the auth state has been determined
    if (loading) {
      return; 
    }

    if (user) {
      // 1. If a user is logged in, try to load their data
      localforage.getItem(`profileData_${user.uid}`).then((saved) => {
        if (saved) {
          setProfile(saved);
        } else {
          // If no data is found for this user, clear the state
          setProfile(null);
        }
      });
    } else {
      // 2. If no user is logged in (e.g., after logout), clear the state
      setProfile(null);
    }
  }, [user, loading]); // 👈 Re-run this effect whenever the user or loading state changes

  const updateProfile = async (data) => {
    setProfile(data);
    if (user) {
      // 3. Save data with the user's ID as part of the key
      await localforage.setItem(`profileData_${user.uid}`, data);
    } else {
      // Handle the case where the user logs out while data is being updated
      await localforage.removeItem(`profileData_${user.uid}`);
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