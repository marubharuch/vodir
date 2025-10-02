// SUMMARY:
// AuthContext.jsx handles authentication state (login/logout) using React Context API.
// - Localforage is used for persistent storage to save the "authUser".
// - Provides `user`, `login`, `logout` globally via AuthProvider.
// - Supports auto-loading user on app start & keeps state in sync with localforage.

// Remarks (Hinglish):
// 👉 Yeh context ek global auth manager hai jo user state ko manage karta hai.
// 👉 Jab user login karega to uska data localforage me store ho jaayega (persistent storage).
// 👉 Jab logout hoga to state clear ho jaayega aur storage se bhi data remove ho jaayega.
// 👉 useEffect ensure karta hai ki app reload hone ke baad bhi user login state restore ho jaye.
// 👉 Agar loading ho rahi hai, to ek simple "Loading..." UI dikhaata hai.

import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App start par localforage se user load karna
  useEffect(() => {
    localforage
      .getItem("authUser")
      .then((savedUser) => {
        if (savedUser) {
          setUser(savedUser);
        }
      })
      .catch((err) => {
        console.error("Auth load error:", err);
      })
      .finally(() => setLoading(false));
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
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth state
export function useAuth() {
  return useContext(AuthContext);
}
