import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

// Ensure the user has a cart, returns the cart id
async function ensureCart(userId) {
  // Check cache first
  const cached = localStorage.getItem("cart_id");
  if (cached) return cached;

  // Try to create one
  const createRes = await fetch(`${API_URL}/cart/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: userId }),
  });

  const createData = await createRes.json();

  if (createRes.ok) {
    localStorage.setItem("cart_id", createData.id);
    return createData.id;
  }

  // Already exists — fetch all carts and find ours
  if (createData.error === "Cart already exists for this user") {
    const allRes = await fetch(`${API_URL}/cart/`);
    const allData = await allRes.json();
    const mine = allData.find((c) => String(c.user) === String(userId));
    if (mine) {
      localStorage.setItem("cart_id", mine.id);
      return mine.id;
    }
  }

  throw new Error("Could not get or create cart.");
}

function ProductCard({ product }) {
  // "idle" | "adding" | "added" | "error"
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // "idle" | "buying" | "bought" | "buyerror"
  const [buyStatus, setBuyStatus] = useState("idle");
  const [buyMsg, setBuyMsg] = useState("");

  const imageSrc = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${API_URL}${product.image}`
    : "https://via.placeholder.com/400x300?text=No+Image";

  const handleAdd = async () => {
    setErrorMsg("");

    // Must be logged in
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("user"));
      } catch {
        return null;
      }
    })();

    if (!user) {
      setErrorMsg("Login to add to cart");
      return;
    }

    setStatus("adding");

    try {
      const cartId = await ensureCart(user.id);

      const res = await fetch(`${API_URL}/cart/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cartId,
          product: product.id,
          quantity: 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add");
      }

      setStatus("added");
      setTimeout(() => setStatus("idle"), 1800);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  const isAdding = status === "adding";
  const isAdded  = status === "added";
  const isError  = status === "error";

  const handleBuyNow = async () => {
    setBuyMsg("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      setBuyMsg("Login to buy");
      setBuyStatus("buyerror");
      setTimeout(() => setBuyStatus("idle"), 2500);
      return;
    }

    setBuyStatus("buying");

    try {
      const res = await fetch(`${API_URL}/checkout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      // safely parse — response might not be JSON if Django crashes
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: `Server error (${res.status})` };

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Checkout failed");
      }

      setBuyStatus("bought");
      setBuyMsg("Email sent!");
      setTimeout(() => { setBuyStatus("idle"); setBuyMsg(""); }, 3000);
    } catch (err) {
      setBuyMsg(err.message);
      setBuyStatus("buyerror");
      setTimeout(() => { setBuyStatus("idle"); setBuyMsg(""); }, 3000);
    }
  };

  const isBuying   = buyStatus === "buying";
  const isBought   = buyStatus === "bought";
  const isBuyError = buyStatus === "buyerror";
  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Wishlist */}
        <button
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-black hover:text-white"
          aria-label="Add to wishlist"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col p-4">

        {/* Category */}
        <span className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
          {product.category_name}
        </span>

        {/* Product Name */}
        <h2 className="mb-1 truncate text-base font-semibold text-black">
          {product.name}
        </h2>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {product.description}
        </p>

        {/* Error message */}
        {isError && errorMsg && (
          <p className="mb-2 text-xs text-red-500">{errorMsg}</p>
        )}

        {/* Price & Button */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-black">
            Rs. {product.price}
          </p>

          <div className="flex items-center gap-2">

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isAdded
                  ? "bg-green-100 text-green-700"
                  : isError
                  ? "bg-red-100 text-red-600"
                  : isAdding
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isAdding ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Adding…
                </>
              ) : isAdded ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 9M17 13l2.3 9M9 22h6"
                    />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={isBuying}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                isBought
                  ? "bg-green-500 text-white"
                  : isBuyError
                  ? "bg-red-100 text-red-600"
                  : isBuying
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isBuying ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending…
                </>
              ) : isBought ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {buyMsg}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </>
              )}
            </button>

          </div>
        </div>

        {/* Buy Now error/status message */}
        {isBuyError && buyMsg && (
          <p className="mt-2 text-xs text-red-500">{buyMsg}</p>
        )}

      </div>
    </div>
  );
}

export default ProductCard;
