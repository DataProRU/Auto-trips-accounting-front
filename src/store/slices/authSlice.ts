import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  username: string | null;
  access_token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  username: localStorage.getItem("username") || null,
  access_token: localStorage.getItem("access_token") || null,
  isAuthenticated: !!localStorage.getItem("access_token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{ username: string; access_token: string }>
    ) {
      state.username = action.payload.username;
      state.access_token = action.payload.access_token;
      state.isAuthenticated = true;
      localStorage.setItem("username", action.payload.username);
      localStorage.setItem("access_token", action.payload.access_token);
    },
    logout(state) {
      state.username = null;
      state.access_token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("username");
      localStorage.removeItem("access_token");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
