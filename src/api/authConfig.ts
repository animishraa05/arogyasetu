// src/api/authConfig.ts

// ✅ Token Utils
export const getAccessToken = () => localStorage.getItem("accessToken");
export const setAccessToken = (token: string) =>
  localStorage.setItem("accessToken", token);

export const getRefreshToken = () => localStorage.getItem("refreshToken");
export const setRefreshToken = (token: string) =>
  localStorage.setItem("refreshToken", token);

// ✅ User Utils
export const getCurrentUser = () => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: any) =>
  localStorage.setItem("currentUser", JSON.stringify(user));

export const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
};