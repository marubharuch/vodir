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
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import localforage from "localforage";

// Summary: This component handles user authentication, allowing users to log in or register
// using either a Google account or an email/password combination. It manages
// form states, interacts with Firebase for authentication, and stores user data
// locally using localforage.

const LoginPage = () => {
  // State variables to manage form inputs and UI state
  const [isRegister, setIsRegister] = useState(false); // Determines if the user is registering or logging in
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false); // Manages button loading state

  // Hooks for navigation and authentication context
  const navigate = useNavigate();
  const { login } = useAuth(); // Custom hook to access the global login function

  // 👉 Google Auth: Handles sign-in with a Google account
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      // Attempt to sign in using a popup window
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Create a clean user object to store
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        phoneNumber: firebaseUser.phoneNumber,
      };

      // Store user data locally and update the global auth state
      await localforage.setItem("authUser", userData);
      await login(userData);

      alert(`Welcome ${userData.displayName || userData.email}! 🎉 Login successful`);
      navigate("/"); // Navigate to the home page on success
    } catch (err) {
      console.warn("Popup blocked, trying redirect…", err);
      // Fallback to a full-page redirect if the popup is blocked
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectErr) {
        console.error("Google redirect failed:", redirectErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // 👉 Email/Password Auth: Handles sign-in or registration with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let firebaseUser;
      if (isRegister) {
        // Create a new user account if isRegister is true
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
      } else {
        // Sign in an existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
      }

      // Create a clean user object for storage
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || name,
        phoneNumber: firebaseUser.phoneNumber || mobile,
      };

      // Store user data and update global auth state
      await localforage.setItem("authUser", userData);
      await login(userData);

      alert(`Welcome ${userData.displayName || userData.email}! 🎉`);
      navigate("/"); // Navigate to the home page
    } catch (err) {
      alert(err.message);
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 👉 Forgot Password: Sends a password reset email
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (err) {
      alert(err.message);
    }
  };

  // JSX for the login/registration form UI
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        {/* Google Login button */}
        <button
          onClick={handleGoogleAuth}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg shadow-md mb-4 transition"
          disabled={loading} // Disable button while loading
        >
          {loading ? "Please wait..." : "Continue with Google"}
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="px-2 text-sm text-gray-500">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Conditionally render name and mobile fields for registration */}
          {isRegister && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border p-2 rounded focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full border p-2 rounded focus:ring focus:ring-blue-300"
                  required
                />
              </div>
            </>
          )}

          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
            disabled={loading} // Disable button while loading
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        {/* Forgot Password button, only visible on the login form */}
        {!isRegister && (
          <button
            onClick={handleForgotPassword}
            className="text-sm text-blue-500 mt-3 hover:underline"
          >
            Forgot Password?
          </button>
        )}

        {/* Toggle between login and registration forms */}
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