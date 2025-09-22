// src/contexts/ProfileContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    localforage.getItem("profileData").then((saved) => {
      if (saved) setProfile(saved);
    });
  }, []);

  const updateProfile = async (data) => {
    setProfile(data);
    await localforage.setItem("profileData", data);
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
