import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // track which item ids are currently being updated/deleted
  const [busy, setBusy] = useState({});

  // ── helpers ──────────────────────────────────────────────

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  };

  const setBusyFor = (id, val) =>
    setBusy((prev) => ({ ...prev, [id]: val }));

  // ── load / create cart ───────────────────────────────────

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError("");

    const user = getUser();
    if (!user) { navigate("/login"); return; }

    try {
      let cid = localStorage.getItem("cart_id");

      if (!cid) {
        const createRes = await fetch(`${API_URL}/cart/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: user.id }),
        });
        const createData = await createRes.json();

        if (createRes.ok) {
          cid = createData.id;
          localStorage.setItem("cart_id", cid);
        } else if (createData.error === "Cart already exists for this user") {
          const allRes = await fetch(`${API_URL}/cart/`);
          const allData = await allRes.json();
          const mine = allData.find((c) => String(c.user) === String(user.id));
          if (mine) {
            cid = mine.id;
            localStorage.setItem("cart_id", cid);
          } else {
            setError("Could not locate your cart.");
            setLoading(false);
            return;
          }
        } else {
          setError(createData.error || "Could not create cart.");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${API_URL}/cart/${cid}/`);
      if (!res.ok) {
        localStorage.removeItem("cart_id");
        setError("Cart not found. Please refresh.");
        setLoading(false);
        return;
      }
      setCart(await res.json());
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadCart(); }, [loadCart]);

  // ── update quantity ──────────────────────────────────────

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;           // don't go below 1 — use remove button

    setBusyFor(item.id, true);
    try {
      const res = await fetch(`${API_URL}/cart/item/${item.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        const updated = await res.json();
        // patch only this item in local state — no full reload needed
        setCart((prev) => ({
          ...prev,
          cart_details: prev.cart_details.map((d) =>
            d.id === item.id ? updated : d
          ),
          cart_total: prev.cart_details
            .map((d) => (d.id === item.id ? updated : d))
            .reduce((sum, d) => sum + parseFloat(d.total_amount), 0)
            .toFixed(2),
        }));
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setBusyFor(item.id, false);
    }
  };

  // ── remove item ──────────────────────────────────────────

  const removeItem = async (itemId) => {
    setBusyFor(itemId, true);
    try {
      const res = await fetch(`${API_URL}/cart/item/${itemId}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCart((prev) => {
          const remaining = prev.cart_details.filter((d) => d.id !== itemId);
          return {
            ...prev,
            cart_details: remaining,
            cart_total: remaining
              .reduce((sum, d) => sum + parseFloat(d.total_amount), 0)
              .toFixed(2),
          };
        });
      }
    } catch {
      // silently fail
    } finally {
      setBusyFor(itemId, false);
    }
  };

  // ── render ───────────────────────────────────────────────

  if (loading) {
    return (
      <div style={s.center}>
        <div style={s.spinner} />
        <p style={s.muted}>Loading cart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.center}>
        <p style={s.errorText}>{error}</p>
        <button style={s.primaryBtn} onClick={loadCart}>Retry</button>
      </div>
    );
  }

  const items = cart?.cart_details ?? [];
  const total = cart?.cart_total ?? 0;

  return (
    <main style={s.page}>
      <div style={s.container}>

        {/* ── header ── */}
        <div style={s.header}>
          <h1 style={s.title}>My Cart</h1>
          {items.length > 0 && (
            <span style={s.badge}>
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {items.length === 0 ? (

          /* ── empty state ── */
          <div style={s.emptyBox}>
            <svg style={s.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 9M17 13l2.3 9M9 22h6" />
            </svg>
            <p style={s.emptyText}>Your cart is empty.</p>
            <button style={s.primaryBtn} onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>

        ) : (

          <div style={s.layout}>

            {/* ── item list ── */}
            <div style={s.itemsList}>
              {items.map((item) => {
                const isBusy = !!busy[item.id];
                return (
                  <div key={item.id} style={{ ...s.card, opacity: isBusy ? 0.6 : 1 }}>

                    <div style={s.cardBody}>

                      {/* product name + remove */}
                      <div style={s.cardHeader}>
                        <p style={s.productName}>{item.product_name}</p>
                        <button
                          style={s.removeBtn}
                          onClick={() => removeItem(item.id)}
                          disabled={isBusy}
                          aria-label={`Remove ${item.product_name}`}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                          </svg>
                          Remove
                        </button>
                      </div>

                      {/* price per unit */}
                      <div style={s.row}>
                        <span style={s.label}>Price per unit</span>
                        <span style={s.value}>Rs. {item.price_per}</span>
                      </div>

                      {/* quantity controls */}
                      <div style={s.row}>
                        <span style={s.label}>Quantity</span>
                        <div style={s.qtyControls}>
                          <button
                            style={s.qtyBtn}
                            onClick={() => updateQty(item, -1)}
                            disabled={isBusy || item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span style={s.qtyNum}>{item.quantity}</span>
                          <button
                            style={s.qtyBtn}
                            onClick={() => updateQty(item, +1)}
                            disabled={isBusy}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* subtotal */}
                      <div style={{ ...s.row, borderTop: "1px solid #f3f4f6", paddingTop: 12, marginTop: 4 }}>
                        <span style={{ ...s.label, fontWeight: 700 }}>Subtotal</span>
                        <span style={s.subtotal}>Rs. {item.total_amount}</span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── order summary ── */}
            <div style={s.summary}>
              <h2 style={s.summaryTitle}>Order Summary</h2>

              <div style={s.summaryRow}>
                <span style={s.muted}>Items ({items.length})</span>
                <span>Rs. {total}</span>
              </div>

              <div style={s.summaryRow}>
                <span style={s.muted}>Shipping</span>
                <span style={{ color: "#16a34a" }}>Free</span>
              </div>

              <div style={s.divider} />

              <div style={{ ...s.summaryRow, fontWeight: 700, fontSize: 18 }}>
                <span>Total</span>
                <span>Rs. {total}</span>
              </div>

              <button
                style={s.checkoutBtn}
                onClick={() => alert("Checkout coming soon!")}
              >
                Proceed to Checkout
              </button>

              <button
                style={s.continueBtn}
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>
            </div>

          </div>
        )}
      </div>

      {/* spinner keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

// ── styles ────────────────────────────────────────────────

const s = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    padding: "40px 16px",
    fontFamily: "Arial, sans-serif",
  },
  container: { maxWidth: 1100, margin: "0 auto" },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 32,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: 700, margin: 0 },
  badge: {
    background: "#2563eb",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
  },

  layout: { display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" },
  itemsList: {
    flex: "1 1 0",
    minWidth: 280,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    transition: "opacity 0.2s",
  },
  cardBody: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    margin: 0,
    fontWeight: 700,
    fontSize: 17,
    color: "#111",
  },
  removeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    border: "1px solid #fecaca",
    borderRadius: 6,
    background: "#fff5f5",
    color: "#dc2626",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { color: "#6b7280", fontSize: 14 },
  value: { fontWeight: 600, fontSize: 14 },

  qtyControls: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 34,
    height: 34,
    border: "none",
    background: "#f9fafb",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    color: "#374151",
    transition: "background 0.15s",
    lineHeight: 1,
  },
  qtyNum: {
    minWidth: 36,
    textAlign: "center",
    fontWeight: 700,
    fontSize: 15,
    borderLeft: "1px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    padding: "0 4px",
    lineHeight: "34px",
  },

  subtotal: { fontWeight: 700, fontSize: 15, color: "#2563eb" },

  summary: {
    width: 300,
    minWidth: 260,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 20,
  },
  summaryTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 20px" },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 15,
  },
  divider: { borderTop: "1px solid #e5e7eb", margin: "16px 0" },

  checkoutBtn: {
    width: "100%",
    padding: 13,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 8,
  },
  continueBtn: {
    width: "100%",
    padding: 11,
    background: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10,
  },

  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 16,
    fontFamily: "Arial, sans-serif",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  emptyBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: "80px 0",
  },
  emptyIcon: { width: 64, height: 64, color: "#9ca3af" },
  emptyText: { fontSize: 18, color: "#6b7280", margin: 0 },

  primaryBtn: {
    padding: "11px 28px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  muted: { color: "#6b7280", fontSize: 14 },
  errorText: { color: "#dc2626", fontSize: 15 },
};

export default Cart;
