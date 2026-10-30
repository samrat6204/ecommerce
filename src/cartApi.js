// Shared helpers for cart + checkout (NEW file)

export const API_URL = "http://127.0.0.1:8000";

// Must match DELIVERY_FEE on the backend (Django default is 80)
export const DELIVERY_FEE = 80;

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

// true only for admin (staff) accounts. The backend also checks this,
// so this is just to show or hide buttons.
export function isAdmin() {
  const u = getUser();
  return Boolean(u && u.is_admin);
}

export function getToken() {
  return localStorage.getItem("access_token");
}

// Tells the navbar (and anyone else listening) that the cart changed,
// so the cart badge updates immediately.
export function notifyCartChanged() {
  window.dispatchEvent(new Event("cart-updated"));
}

export function clearCartCache() {
  localStorage.removeItem("cart_id");
  localStorage.removeItem("cart_owner");
}

// Returns the cart id of this user.
// The cached id is only used if it belongs to the same user, so two people
// using the same browser can never end up in each other's cart.
export async function ensureCart(userId) {
  const cached = localStorage.getItem("cart_id");
  const owner = localStorage.getItem("cart_owner");

  if (cached && String(owner) === String(userId)) return cached;

  clearCartCache();

  // Try to create one
  const createRes = await fetch(`${API_URL}/cart/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: userId }),
  });

  const createData = await createRes.json();

  if (createRes.ok) {
    localStorage.setItem("cart_id", createData.id);
    localStorage.setItem("cart_owner", String(userId));
    return createData.id;
  }

  // Already exists: fetch all carts and find ours
  if (createData.error === "Cart already exists for this user") {
    const allRes = await fetch(`${API_URL}/cart/`);
    const allData = await allRes.json();
    const mine = allData.find((c) => String(c.user) === String(userId));
    if (mine) {
      localStorage.setItem("cart_id", mine.id);
      localStorage.setItem("cart_owner", String(userId));
      return mine.id;
    }
  }

  throw new Error("Could not get or create cart.");
}

// Turns a Django error response into one readable sentence
export function flattenErrors(data) {
  if (!data) return "Something went wrong.";
  if (typeof data === "string") return data;
  if (data.error) return data.error;
  if (data.detail) return data.detail;

  const parts = Object.values(data).map((v) =>
    Array.isArray(v) ? v.join(" ") : String(v)
  );

  return parts.join(" ") || "Something went wrong.";
}

export function money(n) {
  return `Rs. ${Number(n || 0).toFixed(2)}`;
}