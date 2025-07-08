import type { RootState } from "@/types/store";

// Базовые селекторы
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUsername = (state: RootState) => state.auth.user?.username;
export const selectToken = (state: RootState) => state.auth.user?.token;

// Вычисляемые селекторы
export const selectAuthStatus = (state: RootState) => {
  const isAuthenticated = selectIsAuthenticated(state);
  const loading = selectAuthLoading(state);
  const error = selectAuthError(state);
  
  if (loading) return "loading";
  if (error) return "error";
  if (isAuthenticated) return "authenticated";
  return "unauthenticated";
};

export const selectCanLogin = (state: RootState): boolean => {
  const loading = selectAuthLoading(state);
  const isAuthenticated = selectIsAuthenticated(state);
  
  return !loading && !isAuthenticated;
};

export const selectCanLogout = (state: RootState): boolean => {
  const loading = selectAuthLoading(state);
  const isAuthenticated = selectIsAuthenticated(state);
  
  return !loading && isAuthenticated;
}; 