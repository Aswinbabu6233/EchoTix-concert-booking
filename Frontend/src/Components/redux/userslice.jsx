import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userId: null,
    role: null,
    token: null,
    name: null,
    email: null,
    profileImage: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload.userId;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.profileImage = action.payload.profileImage;
    },
    clearUser: (state) => {
      state.userId = null;
      state.role = null;
      state.token = null;
      state.name = null;
      state.email = null;
      state.profileImage = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
