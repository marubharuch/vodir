// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { ref, get, set } from "firebase/database";   // ⭐ RTDB IMPORT
import { auth } from "../firebase";
import { db } from "../firebase";                    // ⭐ RTDB instance
import { useAuth } from "../context/AuthContext";
import localforage from "localforage";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [mobile, setMobile]     = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  /* -----------------------------------------------------
     ⭐ 1. Google Sign-In Handler
  ----------------------------------------------------- */
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        phoneNumber: firebaseUser.phoneNumber || "",
      };

      // ⭐ Save locally
      await localforage.setItem("authUser", userData);
      await login(userData);

      // ⭐ Ensure user exists in RTDB
      await ensureUserInRTDB(userData);

      navigate("/");
    } catch (err) {
      console.error("Google Login Error:", err);
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectErr) {
        console.error("Google Redirect failed:", redirectErr);
      }
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------
     ⭐ 2. Email/Password Login or Register
  ----------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let firebaseUser;

      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = res.user;
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = res.user;
      }

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || name,
        phoneNumber: firebaseUser.phoneNumber || mobile,
      };

      // ⭐ Save locally
      await localforage.setItem("authUser", userData);
      await login(userData);

      // ⭐ Create / Update user's RTDB entry
      await ensureUserInRTDB(userData);

      navigate("/");
    } catch (err) {
      console.error("Auth Error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------
     ⭐ 3. Create missing /users/<uid> entry in RTDB
  ----------------------------------------------------- */
  const ensureUserInRTDB = async (userData) => {
    const userRef = ref(db, `users/${userData.uid}`);
    const snap = await get(userRef);

    if (!snap.exists()) {
      await set(userRef, {
        email: userData.email,
        name: userData.displayName || "",
        mobile: userData.phoneNumber || "",
        familySrno: null,        // ⭐ IMPORTANT
        role: "newUser",         // helps your app identify new users
      });
      console.log("👤 User created in RTDB:", userData.uid);
    } else {
      console.log("👤 User already exists in RTDB.");
    }
  };

  /* -----------------------------------------------------
     ⭐ 4. Forgot Password
  ----------------------------------------------------- */
  const handleForgotPassword = async () => {
    if (!email) return alert("Enter your email first.");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (err) {
      alert(err.message);
    }
  };

  /* -----------------------------------------------------
     ⭐ 5. UI Rendering
  ----------------------------------------------------- */
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        {/* Google Auth button */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg mb-4 transition"
        >
          {loading ? "Please wait…" : "Continue with Google"}
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="px-2 text-sm text-gray-500">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border p-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="tel"
                placeholder="Mobile Number"
                className="w-full border p-2 rounded"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        {!isRegister && (
          <button
            onClick={handleForgotPassword}
            className="text-sm text-blue-500 mt-3 hover:underline"
          >
            Forgot Password?
          </button>
        )}

        <p className="mt-6 text-center text-gray-600">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isRegister ? "Login here" : "Register here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
