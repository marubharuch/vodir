import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localforage on app start
  useEffect(() => {
    localforage
      .getItem("authUser")
      .then((savedUser) => {
        if (savedUser) {
          // Optional: check expiry
          // if (savedUser.expiresAt && savedUser.expiresAt < Date.now()) {
          //   localforage.removeItem("authUser");
          // } else {
          setUser(savedUser);
          // }
        }
      })
      .catch((err) => {
        console.error("Auth load error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Login → save to state + localforage
  const login = async (userData) => {
    // Optional expiry: 24h
    // const dataWithExpiry = { ...userData, expiresAt: Date.now() + 24*60*60*1000 };
    // setUser(dataWithExpiry);
    // await localforage.setItem("authUser", dataWithExpiry);

    setUser(userData);
    await localforage.setItem("authUser", userData);
  };

  // Logout → clear state + localforage
  const logout = async () => {
    setUser(null);
    await localforage.removeItem("authUser");
  };

  // Show loading fallback until localforage check completes
  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth context
export function useAuth() {
  return useContext(AuthContext);
}
