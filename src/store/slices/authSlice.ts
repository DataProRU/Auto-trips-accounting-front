import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { AuthState } from "@/types/store";

import { authService } from "@/services/authService";

export const login = createAsyncThunk<
  { username: string; token: string },
  { username: string; password: string },
  { rejectValue: string }
>(
  "auth/login",
  async (
    credentials: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.login(credentials);
      return {
        username: response.username,
        token: response.access_token,
      };
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || "Ошибка авторизации"
        );
      }
      return rejectWithValue("Ошибка авторизации");
    }
  }
);

export const verifyToken = createAsyncThunk<
  { username: string; token: string },
  string,
  { rejectValue: string }
>("auth/verifyToken", async (token: string, { getState, rejectWithValue }) => {
  try {
    const response = await authService.verify(token);
    if (response.valid) {
      const state = getState() as { auth: AuthState };
      const username =
        state.auth.user?.username || localStorage.getItem("username") || "";
      console.log("verifyToken success, username:", username);
      return {
        username,
        token: token,
      };
    } else {
      console.log("verifyToken failed - token invalid");
      return rejectWithValue("");
    }
  } catch (error: unknown) {
    console.log("verifyToken error:", error);
    if (error instanceof Error && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        axiosError.response?.data?.message || "Ошибка проверки токена"
      );
    }
    return rejectWithValue("Ошибка проверки токена");
  }
});

export const refreshToken = createAsyncThunk<
  { username: string; token: string },
  void,
  { rejectValue: string }
>("auth/refreshToken", async (_, { getState, rejectWithValue }) => {
  try {
    const response = await authService.refresh();
    // username берем из store или localStorage
    const state = getState() as { auth: AuthState };
    const username =
      state.auth.user?.username || localStorage.getItem("username") || "";
    return {
      username,
      token: response.access_token,
    };
  } catch (error: unknown) {
    if (error instanceof Error && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        axiosError.response?.data?.message || "Ошибка обновления токена"
      );
    }
    return rejectWithValue("Ошибка обновления токена");
  }
});

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
