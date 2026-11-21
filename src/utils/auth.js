/**
 * Saauzi — Authentication Helpers
 * =================================
 * Simple utility functions that read the logged-in user's data
 * from localStorage.
 *
 * These are used across the app to:
 *   - Get the JWT access token for API requests
 *   - Get the user object (id, username, email, is_admin)
 *   - Check if the current user is an admin
 *
 * Data is saved to localStorage by the Login page after a successful login.
 * It is cleared by the Navbar when the user clicks Logout.
 *
 * localStorage keys used:
 *   "user"         → JSON string of the user object
 *   "access_token" → JWT access token (expires in 60 minutes)
 */


// Key names must match what login.jsx saves to localStorage.
const USER_KEY  = "user";
const TOKEN_KEY = "access_token";


/**
 * getToken()
 * Returns the JWT access token saved after login.
 * Send this in every protected API request:
 *   Authorization: Bearer <token>
 *
 * Returns null if the user is not logged in.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}


/**
 * getUser()
 * Returns the logged-in user object from localStorage.
 *
 * User object shape:
 *   {
 *     id          : number   — user's database ID
 *     username    : string   — login name
 *     full_name   : string   — display name
 *     email       : string   — email address
 *     phone_number: string   — contact number
 *     is_admin    : boolean  — true for staff/admin accounts
 *   }
 *
 * Returns null if nobody is logged in or the saved data is invalid.
 */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    // localStorage value was corrupted — treat as logged out
    return null;
  }
}


/**
 * isAdmin()
 * Returns true if the logged-in user is an admin (staff) account.
 *
 * Used to show or hide admin-only UI:
 *   - Add/Delete Category buttons
 *   - Add Product form
 *   - Admin dashboard links
 *
 * IMPORTANT: This is a frontend-only check for showing/hiding UI.
 * The backend independently verifies is_staff on every admin API call.
 * So even if someone fakes is_admin in localStorage, the backend rejects them.
 */
export function isAdmin() {
  return Boolean(getToken() && getUser()?.is_admin);
}
