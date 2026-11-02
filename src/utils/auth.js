// ⚠️ Change these two keys if your Login page saves them under different names.
const USER_KEY = "user";
const TOKEN_KEY = "access_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function isAdmin() {
  return Boolean(getToken() && getUser()?.is_admin);
}