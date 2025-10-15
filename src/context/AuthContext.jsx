// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 QUICK LOAD FIX: Single useEffect to handle both local cache and Firebase sync
  useEffect(() => {
    
    // 1. LocalForage se user data load karna (Fastest check, Promise-based)
    localforage.getItem("authUser")
      .then((storedUser) => {
        if (storedUser) {
          // Turant user state restore karo (ProfileContext jaldi trigger hoga)
          setUser(storedUser);
          // Note: setLoading ko abhi false nahi karna, kyunki Firebase sync pending hai
        }
      })
      .catch((err) => {
        console.error("Auth load error:", err);
      })
      .finally(() => {
        
        // 2. Firebase Auth state change ke liye listener set karna
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          
          // Local state (jo abhi localforage se loaded ho sakta hai) ko Firebase se sync karein
          if (firebaseUser) {
            const finalUser = 
              (user && user.uid === firebaseUser.uid) ? user : { // Local state ko prefer karo agar woh already set hua hai
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
            };
            setUser(finalUser);
          } else {
            // Logged out. State clear karo.
            setUser(null);
            localforage.removeItem("authUser");
          }
          
          // CRITICAL: Loading state sirf yahan ek baar band hogi (jab Firebase sync ho jaaye)
          setLoading(false);
        });

        return unsubscribe; // Cleanup function
      });
      
  }, []); 

  // Login → state + localforage me user save karo
  const login = async (userData) => {
    setUser(userData);
    await localforage.setItem("authUser", userData);
  };

  // Logout → state + localforage clear karo
  const logout = async () => {
    setUser(null);
    await localforage.removeItem("authUser");
    // Firebase se bhi sign out karna zaruri hai
    await auth.signOut();
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  // NOTE: You need to include the 'logout' function in the provider's value if you use it in other components
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth state
export function useAuth() {
  return useContext(AuthContext);
}