// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // 1️⃣ Load cached user immediately (fast UI)
    localforage.getItem("authUser")
      .then((cachedUser) => {
        if (cachedUser) {
          setUser(cachedUser);
        }
      })
      .catch((err) => console.error("Auth load error:", err))
      .finally(() => {

        // 2️⃣ Attach Firebase listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

          if (firebaseUser) {
            // Always use clean Firebase user object
            const freshUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "",
              phoneNumber: firebaseUser.phoneNumber || "",
            };

            setUser(freshUser);
            await localforage.setItem("authUser", freshUser);
          } else {
            setUser(null);
            await localforage.removeItem("authUser");
          }

          setLoading(false);
        });

        return unsubscribe;
      });

  }, []);

  // Manual login (if you use custom flow)
  const login = async (userData) => {
    setUser(userData);
    await localforage.setItem("authUser", userData);
  };

  const logout = async () => {
    setUser(null);
    await localforage.removeItem("authUser");
    await auth.signOut();
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
