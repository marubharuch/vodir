// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from localforage at start
  useEffect(() => {
    localforage.getItem("authUser").then((savedUser) => {
      if (savedUser) setUser(savedUser);
    });
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await localforage.setItem("authUser", userData);
  };

  const logout = async () => {
    setUser(null);
    await localforage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
