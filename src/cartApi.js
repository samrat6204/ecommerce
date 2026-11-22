/**
 * Saauzi — Shared Cart & API Utilities
 * ======================================
 * This file contains all shared helper functions used across the app.
 * Import what you need from this file instead of repeating code in every page.
 *
 * What is in here:
 *   - API base URL
 *   - Delivery fee constant
 *   - User / token helpers (read from localStorage)
 *   - Cart helpers (create, find, cache)
 *   - Error message formatter
 *   - Money formatter
 */


// ─── API BASE URL ─────────────────────────────────────────────────────────────
// All fetch() calls use this base URL.
// Change this one line if the backend moves to a different address.
export const API_URL = "http://127.0.0.1:8000";


// ─── DELIVERY FEE ────────────────────────────────────────────────────────────
// Must match DELIVERY_FEE in Django settings.py (default: 80).
// Change it in one place here and it updates everywhere.
export const DELIVERY_FEE = 80;


// ─── USER HELPERS ─────────────────────────────────────────────────────────────

/**
 * getUser()
 * Returns the logged-in user object from localStorage.
 * Returns null if nobody is logged in or the data is corrupted.
 *
 * The user object looks like:
 *   { id, username, full_name, email, phone_number, is_admin }
 */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

/**
 * isAdmin()
 * Returns true if the logged-in user is an admin (staff) account.
 * Used to show/hide admin buttons like Delete Category, Add Product, etc.
 *
 * NOTE: The backend also checks is_staff independently.
 * This frontend check is only for UI — it cannot replace backend authorization.
 */
export function isAdmin() {
  const user = getUser();
  return Boolean(user && user.is_admin);
}

/**
 * getToken()
 * Returns the JWT access token from localStorage.
 * This token must be sent in the Authorization header for protected endpoints:
 *   Authorization: Bearer <token>
 *
 * Returns null if the user is not logged in.
 */
export function getToken() {
  return localStorage.getItem("access_token");
}


// ─── CART HELPERS ─────────────────────────────────────────────────────────────

/**
 * notifyCartChanged()
 * Fires a custom browser event "cart-updated".
 * The Navbar listens for this event to refresh the cart badge count
 * immediately after an item is added or removed.
 */
export function notifyCartChanged() {
  window.dispatchEvent(new Event("cart-updated"));
}

/**
 * clearCartCache()
 * Removes the cached cart_id and cart_owner from localStorage.
 * Called when the user logs out or when the cached cart is no longer valid.
 */
export function clearCartCache() {
  localStorage.removeItem("cart_id");
  localStorage.removeItem("cart_owner");
}

/**
 * ensureCart(userId)
 * Finds or creates a cart for the given user and returns the cart ID.
 *
 * How it works:
 *   1. Check localStorage for a cached cart_id that belongs to this user.
 *   2. If found and owned by the same user → return it immediately (fast).
 *   3. If not found → POST /cart/ to create a new cart on the backend.
 *   4. If the backend says "cart already exists" → GET /cart/ to find it.
 *   5. Cache the cart_id and cart_owner in localStorage for next time.
 *
 * cart_owner is stored alongside cart_id so two different users on the
 * same browser never end up sharing the same cart.
 *
 * @param {number} userId - The logged-in user's ID
 * @returns {Promise<string>} - The cart ID
 * @throws {Error} - If the cart cannot be created or found
 */
export async function ensureCart(userId) {
  const cached = localStorage.getItem("cart_id");
  const owner  = localStorage.getItem("cart_owner");

  // Use cached cart only if it belongs to this user
  if (cached && String(owner) === String(userId)) return cached;

  // Clear any stale cache before trying again
  clearCartCache();

  // Try to create a new cart
  const createRes = await fetch(`${API_URL}/cart/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: userId }),
  });

  const createData = await createRes.json();

  if (createRes.ok) {
    // New cart created — cache it
    localStorage.setItem("cart_id", createData.id);
    localStorage.setItem("cart_owner", String(userId));
    return createData.id;
  }

  // Cart already exists — find it by fetching all carts
  if (createData.error === "Cart already exists for this user") {
    const allRes  = await fetch(`${API_URL}/cart/`);
    const allData = await allRes.json();
    const mine    = allData.find((c) => String(c.user) === String(userId));

    if (mine) {
      localStorage.setItem("cart_id", mine.id);
      localStorage.setItem("cart_owner", String(userId));
      return mine.id;
    }
  }

  throw new Error("Could not get or create cart.");
}


// ─── ERROR HELPERS ────────────────────────────────────────────────────────────

/**
 * flattenErrors(data)
 * Converts a Django error response into one readable sentence.
 *
 * Django can return errors in many formats:
 *   { "error": "Something went wrong." }
 *   { "detail": "Authentication credentials were not provided." }
 *   { "username": ["This field is required."], "email": ["Enter a valid email."] }
 *
 * This function handles all formats and returns a single string.
 *
 * @param {object} data - The JSON response body from Django
 * @returns {string} - A human-readable error message
 */
export function flattenErrors(data) {
  if (!data)                return "Something went wrong.";
  if (typeof data === "string") return data;
  if (data.error)           return data.error;
  if (data.detail)          return data.detail;

  // Field-level errors: combine all messages into one sentence
  const parts = Object.values(data).map((v) =>
    Array.isArray(v) ? v.join(" ") : String(v)
  );

  return parts.join(" ") || "Something went wrong.";
}


// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────

/**
 * money(n)
 * Formats a number as a Nepali Rupee price string.
 * Example: money(120) → "Rs. 120.00"
 *
 * @param {number|string} n - The amount to format
 * @returns {string} - Formatted price string
 */
export function money(n) {
  return `Rs. ${Number(n || 0).toFixed(2)}`;
}
