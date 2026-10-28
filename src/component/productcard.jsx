import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { API_URL, ensureCart, getUser, getToken } from "../cartApi";

// ============================================================
// STAR RATING
// ============================================================

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

// One star. `fill` is 0..1 (supports partial stars like 4.3)
function Star({ fill, onClick, onMouseEnter, interactive }) {
  return (
    <span
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`relative inline-block h-5 w-5 ${
        interactive ? "cursor-pointer" : ""
      }`}
    >
      {/* empty star */}
      <svg
        className="absolute inset-0 h-5 w-5 text-gray-300"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d={STAR_PATH} />
      </svg>

      {/* filled star, clipped by width */}
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }}
      >
        <svg
          className="h-5 w-5 text-yellow-400"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d={STAR_PATH} />
        </svg>
      </span>
    </span>
  );
}

// ============================================================
// BUY NOW POPUP (NEW)
// Drawn with a portal so the card's hover animation and
// overflow-hidden can never clip or move it.
// ============================================================

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  box: {
    width: "100%",
    maxWidth: 400,
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    fontFamily: "Arial, sans-serif",
  },
  iconWrap: {
    width: 52,
    height: 52,
    margin: "0 auto 14px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" },
  name: { margin: "0 0 14px", fontSize: 14, color: "#6b7280" },
  question: { margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "#111" },
  doneBtn: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    border: "none",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  continueBtn: {
    width: "100%",
    padding: 11,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
    color: "#374151",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

function BuyNowModal({ productName, onDone, onContinue }) {
  return createPortal(
    <div style={modalStyles.overlay} onClick={onContinue}>
      <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.iconWrap}>
          <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 style={modalStyles.title}>Added to your order</h3>
        <p style={modalStyles.name}>{productName}</p>

        <p style={modalStyles.question}>Do you want to add another product?</p>

        <button style={modalStyles.doneBtn} onClick={onDone}>
          I'm done, go to checkout
        </button>

        <button style={modalStyles.continueBtn} onClick={onContinue}>
          Continue shopping
        </button>
      </div>
    </div>,
    document.body
  );
}

// ============================================================
// PRODUCT CARD
// ============================================================

function ProductCard({ product }) {
  const navigate = useNavigate();

  // "idle" | "adding" | "added" | "error"
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // "idle" | "buying" | "buyerror"
  const [buyStatus, setBuyStatus] = useState("idle");
  const [buyMsg, setBuyMsg] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);

  // ---------- RATING STATE ----------
  const [avgRating, setAvgRating] = useState(Number(product.average_rating) || 0);
  const [ratingCount, setRatingCount] = useState(Number(product.rating_count) || 0);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingMsg, setRatingMsg] = useState("");

  const imageSrc = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${API_URL}${product.image}`
    : "https://via.placeholder.com/400x300?text=No+Image";

  const handleAdd = async () => {
    setErrorMsg("");

    // Must be logged in
    const user = getUser();

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

  // ---------- BUY NOW (CHANGED) ----------
  // Old: sent the confirmation email straight away.
  // New: adds the product to the cart, then asks
  //      "Do you want to add another product?"
  const handleBuyNow = async () => {
    setBuyMsg("");

    const user = getUser();
    const token = getToken();

    if (!user || !token) {
      setBuyMsg("Login to buy");
      setBuyStatus("buyerror");
      setTimeout(() => setBuyStatus("idle"), 2500);
      return;
    }

    setBuyStatus("buying");

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
        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : { error: `Server error (${res.status})` };
        throw new Error(data.error || "Could not add to order");
      }

      setBuyStatus("idle");
      setShowBuyModal(true);
    } catch (err) {
      setBuyMsg(err.message);
      setBuyStatus("buyerror");
      setTimeout(() => { setBuyStatus("idle"); setBuyMsg(""); }, 3000);
    }
  };

  const isBuying   = buyStatus === "buying";
  const isBuyError = buyStatus === "buyerror";

  // ---------- RATE PRODUCT ----------
  const handleRate = async (score) => {
    setRatingMsg("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      setRatingMsg("Login to rate");
      setTimeout(() => setRatingMsg(""), 2500);
      return;
    }

    setRatingSaving(true);

    try {
      const res = await fetch(`${API_URL}/products/${product.id}/rate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ score }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: `Server error (${res.status})` };

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Rating failed");
      }

      setMyRating(data.my_rating);
      setAvgRating(Number(data.average_rating) || 0);
      setRatingCount(Number(data.rating_count) || 0);
      setRatingMsg("Thanks for rating!");
      setTimeout(() => setRatingMsg(""), 2000);
    } catch (err) {
      setRatingMsg(err.message);
      setTimeout(() => setRatingMsg(""), 2500);
    } finally {
      setRatingSaving(false);
    }
  };

  // what the stars show: hover > my rating > average
  const shownRating = hoverRating || myRating || avgRating;

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
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {product.description}
        </p>

        {/* ===== Star Rating ===== */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center ${
                ratingSaving ? "pointer-events-none opacity-60" : ""
              }`}
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  interactive
                  fill={shownRating - (n - 1)}
                  onMouseEnter={() => setHoverRating(n)}
                  onClick={() => handleRate(n)}
                />
              ))}
            </div>

            <span className="text-xs text-gray-500">
              {ratingCount > 0
                ? `${avgRating.toFixed(1)} (${ratingCount})`
                : "No ratings yet"}
            </span>
          </div>

          {ratingMsg && (
            <p className="mt-1 text-xs text-gray-500">{ratingMsg}</p>
          )}
        </div>

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
                isBuyError
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
                  Adding…
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

      {/* "Do you want to add another product?" popup */}
      {showBuyModal && (
        <BuyNowModal
          productName={product.name}
          onContinue={() => setShowBuyModal(false)}
          onDone={() => {
            setShowBuyModal(false);
            navigate("/checkout");
          }}
        />
      )}
    </div>
  );
}

export default ProductCard;

