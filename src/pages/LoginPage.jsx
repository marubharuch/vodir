// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { ref, get, set } from "firebase/database";
import { auth, db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import localforage from "localforage";
import LoginRecoverModal from "../components/LoginRecoverModal";

const LoginPage = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  /* -----------------------------------
     ⭐ Google Login
  ----------------------------------- */
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        phoneNumber: firebaseUser.phoneNumber || ""
      };

      await localforage.setItem("authUser", userData);
      await login(userData);
      await ensureUserInRTDB(userData, "google");

      navigate("/");
    } catch (err) {
      console.error("Google Login Error:", err);
      alert("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------
     ⭐ Email Login / Register
  ----------------------------------- */
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
        phoneNumber: firebaseUser.phoneNumber || mobile
      };

      await localforage.setItem("authUser", userData);
      await login(userData);
      await ensureUserInRTDB(userData, "password");

      navigate("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
const handleForgotPassword = async () => {
  if (!email) {
    alert("Enter your email first.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent.");
  } catch (error) {
    alert(error.message);
  }
};

  /* -----------------------------------
     ⭐ Ensure user exists in RTDB
  ----------------------------------- */
  const ensureUserInRTDB = async (userData, provider) => {
    const userRef = ref(db, `users/${userData.uid}`);
    const snap = await get(userRef);

    if (!snap.exists()) {
      await set(userRef, {
        email: userData.email,
        name: userData.displayName || "",
        mobile: userData.phoneNumber || "",
        familySrno: null,
        role: "newUser",
        provider
      });
    }
  };

  /* -----------------------------------
     ⭐ Recovered account selection
  ----------------------------------- */
  const handleRecoveredUserSelect = async (user) => {
    setShowRecoverModal(false);

    // Auto-login if Google provider
    if (user.provider === "google") {
      alert(
        `✔ Account found.\nThis account uses Google Login.\nAutomatically logging in…`
      );
      handleGoogleAuth();
      return;
    }

    // Email/password → only auto-fill email
    setShowEmailForm(true);
    setEmail(user.email);

    alert(
      `✔ Account found!\nYour email is filled.\nPlease enter your password to login.`
    );
  };

  return (
    <>
      <LoginRecoverModal
        show={showRecoverModal}
        onClose={() => setShowRecoverModal(false)}
        onSelectUser={handleRecoveredUserSelect}
      />

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>

          {/* Google Login */}
          {!showEmailForm && (
            <>
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition mb-4"
              >
                Continue with Google
              </button>

              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full bg-gray-700 text-white py-2 rounded-lg"
              >
                Use email / password
              </button>

              <p
                onClick={() => setShowRecoverModal(true)}
                className="mt-3 text-center text-blue-600 underline cursor-pointer"
              >
                Forgot Email / Login Details?
              </p>
            </>
          )}

          {/* Email Login */}
          {showEmailForm && (
            <>
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
                      type="text"
                      placeholder="Mobile"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                >
                  {isRegister ? "Register" : "Login"}
                </button>
              </form>

              <p
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 mt-2 underline cursor-pointer"
              >
                Forgot Password?
              </p>

              <p className="mt-6 text-center">
                {isRegister ? "Already registered?" : "New user?"}{" "}
                <span
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-blue-600 underline cursor-pointer"
                >
                  {isRegister ? "Login here" : "Register here"}
                </span>
              </p>

              <button
                onClick={() => setShowEmailForm(false)}
                className="mt-4 w-full text-gray-500 underline"
              >
                Back to Google Login
              </button>

              <p
                onClick={() => setShowRecoverModal(true)}
                className="mt-3 text-center text-blue-600 underline cursor-pointer"
              >
                Forgot Email / Login Details?
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
