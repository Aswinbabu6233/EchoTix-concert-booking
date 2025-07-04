import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userslice";

const storeduser = localStorage.getItem("user");
const preloaduser = storeduser ? JSON.parse(storeduser) : null;
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: {
    user: {
      userId: preloaduser?.userId || null,
      role: preloaduser?.role || null,
      token: preloaduser?.token || null,
      name: preloaduser?.name || null,
      email: preloaduser?.email || null,
      profileImage: preloaduser?.profileImage || null,
    },
  },
});
