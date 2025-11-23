// Simple mock authentication utilities
export const AUTH_KEY = "pollensense_auth";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, "true");
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

