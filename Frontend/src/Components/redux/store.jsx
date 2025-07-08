// store.js or store.jsx
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userslice";
import { jwtDecode } from "jwt-decode";

// Default user state
let storedUser = {
  userId: null,
  role: null,
  token: null,
  name: null,
  email: null,
  profileImage: null,
};

// ✅ Get user object (not just token)
const userData = localStorage.getItem("user");

if (userData) {
  try {
    const parsedUser = JSON.parse(userData);
    const decoded = jwtDecode(parsedUser.token);

    // Check if token is still valid
    const isTokenValid = decoded.exp * 1000 > Date.now();

    if (isTokenValid) {
      storedUser = parsedUser;
    } else {
      localStorage.removeItem("user");
    }
  } catch (err) {
    console.error("Invalid token or user data:", err);
    localStorage.removeItem("user");
  }
}

// Create Redux store
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: {
    user: storedUser,
  },
});
