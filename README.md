📘 Project Documentation
🚀 Overview

This is a React + Vite + Tailwind project that uses React Context + localForage to handle:

Authentication (login/logout)

User Profile persistence

Protected routes

📂 Project Structure (Key Files)

src/App.jsx

Main app entry.

Wraps everything with AuthProvider and ProfileProvider.

Defines all routes using react-router-dom.

Uses PrivateRoute to restrict access to authenticated users.

Common UI: Navbar, BottomNav, InstallButton.

src/context/AuthContext.jsx

Manages authentication state.

Saves and loads user data from localForage under key authUser.

Exposes:

user: logged-in user object (or null).

login(userData): logs in + persists.

logout(): clears login data.

Provides useAuth() hook for easy access.

src/context/ProfileContext.jsx

Manages profile state (separate from auth).

Saves/loads data from localForage under key `profileData_${user.uid}`.

Exposes:

profile: current profile object.

updateProfile(data): update + persist.

Provides useProfile() hook.

🛠️ Setup & Run

Clone repository:

git clone <repo-url>
cd project-folder


Install dependencies:

npm install


Start development server:

npm run dev


Build for production:

npm run build

🔑 Key Concepts

Contexts

AuthContext: Who is logged in.

ProfileContext: Profile data (family/user info).

Protected Routes

PrivateRoute checks if user exists.

Redirects to /login if not authenticated.

Persistence

Data stored in localForage (IndexedDB).

Works offline and reloads with saved state.

✅ Coding Guidelines

Always use hooks (useAuth, useProfile) instead of accessing state directly.

Use login() / logout() for authentication changes.

Use updateProfile() for profile changes.

Add new pages inside /pages/ and declare them in App.jsx.

Wrap private routes with <PrivateRoute>.