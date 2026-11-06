import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  API_URL,
  DELIVERY_FEE,
  getUser,
  getToken,
  ensureCart,
  clearCartCache,
  flattenErrors,
  money,
  notifyCartChanged,
} from "../cartApi";

// Put your QR image in the React "public" folder with this name.
// Example: public/payment-qr.png  ->  "/payment-qr.png"
const QR_IMAGE = "/payment-qr.png";

// Edit this text with your real terms.
const COD_TERMS = [
  "Cash on Delivery orders must be paid in full to the delivery person when the order arrives.",
  "Please keep the exact amount ready and be available on the phone number you gave us.",
  "If the order is refused or we cannot reach you after several attempts, it may be cancelled.",
  "Delivery fee is charged on every order and is not refundable after dispatch.",
];

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // ids ticked on the cart page. If missing (page refreshed or opened
  // directly), the whole cart is shown and ordered.
  const selectedIds = location.state?.itemIds;

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState(() => {
    const u = getUser();
    return {
      full_name: u?.full_name || "",
      phone_number: u?.phone_number || "",
      address: "",
      note: "",
    };
  });

  // "" | "cod" | "online"
  const [paymentMethod, setPaymentMethod] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [qrMissing, setQrMissing] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── load the cart ────────────────────────────────────────

  const loadCart = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    const user = getUser();
    const token = getToken();

    // login is required
    if (!user || !token) {
      navigate("/login");
      return;
    }

    try {
      const cid = await ensureCart(user.id);
      const res = await fetch(`${API_URL}/cart/${cid}/`);

      if (!res.ok) {
        clearCartCache();
        setLoadError("Cart not found. Please refresh.");
        return;
      }

      setCart(await res.json());
    } catch {
      setLoadError("Could not load your cart. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadCart(); }, [loadCart]);

  // the cart lines that this checkout will order
  const getOrderItems = () => {
    const all = cart?.cart_details ?? [];
    return selectedIds ? all.filter((d) => selectedIds.includes(d.id)) : all;
  };

  // ── form helpers ─────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError("");
  };

  const choosePayment = (method) => {
    setPaymentMethod(method);
    setSubmitError("");
  };

  // ── place order ──────────────────────────────────────────

  const placeOrder = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitError("");

    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/orders/place/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name,
          phone_number: form.phone_number,
          address: form.address,
          note: form.note,
          payment_method: paymentMethod,
          terms_accepted: termsAccepted,
          payment_reference: paymentMethod === "online" ? paymentReference : "",
          item_ids: getOrderItems().map((d) => d.id),
        }),
      });

      // safely parse: response might not be JSON if Django crashes
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: `Server error (${res.status})` };

      if (res.status === 401) {
        setSubmitError("Your session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      if (!res.ok) {
        throw new Error(flattenErrors(data));
      }

      notifyCartChanged();

      navigate(`/order-success/${data.order.id}`, {
        state: { emailSent: data.email_sent, message: data.message },
      });
    } catch (err) {
      setSubmitError(err.message || "Could not place the order.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── render ───────────────────────────────────────────────

  if (loading) {
    return (
      <div style={s.center}>
        <div style={s.spinner} />
        <p style={s.muted}>Loading checkout…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={s.center}>
        <p style={s.errorText}>{loadError}</p>
        <button style={s.primaryBtn} onClick={loadCart}>Retry</button>
      </div>
    );
  }

  const items = getOrderItems();

  if (items.length === 0) {
    return (
      <div style={s.center}>
        <p style={s.emptyText}>Your cart is empty.</p>
        <button style={s.primaryBtn} onClick={() => navigate("/products")}>
          Browse Products
        </button>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, d) => sum + (parseFloat(d.total_amount) || 0),
    0
  );
  const total = subtotal + DELIVERY_FEE;

  const detailsFilled =
    form.full_name.trim() && form.phone_number.trim() && form.address.trim();

  const canSubmit =
    !submitting &&
    detailsFilled &&
    paymentMethod !== "" &&
    (paymentMethod !== "cod" || termsAccepted);

  return (
    <main style={s.page}>
      <div style={s.container}>

        <h1 style={s.title}>Checkout</h1>

        <form onSubmit={placeOrder} style={s.layout}>

          {/* ───────── LEFT SIDE ───────── */}
          <div style={s.left}>

            {/* 1. Selected products */}
            <section style={s.box}>
              <h2 style={s.boxTitle}>1. Your products</h2>

              {items.map((item) => (
                <div key={item.id} style={s.itemRow}>
                  <div>
                    <p style={s.itemName}>{item.product_name}</p>
                    <p style={s.itemMeta}>
                      Rs. {item.price_per} x {item.quantity}
                    </p>
                  </div>
                  <p style={s.itemTotal}>Rs. {item.total_amount}</p>
                </div>
              ))}

              <button
                type="button"
                style={s.linkBtn}
                onClick={() => navigate("/cart")}
              >
                Edit cart
              </button>
            </section>

            {/* 2. Delivery details */}
            <section style={s.box}>
              <h2 style={s.boxTitle}>2. Delivery details</h2>

              <label style={s.label}>Full name</label>
              <input
                style={s.input}
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />

              <label style={s.label}>Phone number</label>
              <input
                style={s.input}
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="98XXXXXXXX"
                required
              />

              <label style={s.label}>Delivery address</label>
              <textarea
                style={{ ...s.input, minHeight: 80, resize: "vertical" }}
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="City, area, street, landmark"
                required
              />

              <label style={s.label}>Note (optional)</label>
              <input
                style={s.input}
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Anything we should know?"
              />
            </section>

            {/* 3. Payment method */}
            <section style={s.box}>
              <h2 style={s.boxTitle}>3. Payment method</h2>

              {/* Cash on Delivery */}
              <label
                style={{
                  ...s.payOption,
                  ...(paymentMethod === "cod" ? s.payOptionActive : {}),
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => choosePayment("cod")}
                />
                <div>
                  <p style={s.payTitle}>Cash on Delivery</p>
                  <p style={s.payHint}>Pay in cash when your order arrives</p>
                </div>
              </label>

              {paymentMethod === "cod" && (
                <div style={s.subBox}>
                  <p style={s.termsTitle}>Terms and conditions</p>
                  <ul style={s.termsList}>
                    {COD_TERMS.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>

                  <label style={s.checkRow}>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <span>I have read and accept the terms and conditions</span>
                  </label>
                </div>
              )}

              {/* Online payment */}
              <label
                style={{
                  ...s.payOption,
                  ...(paymentMethod === "online" ? s.payOptionActive : {}),
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "online"}
                  onChange={() => choosePayment("online")}
                />
                <div>
                  <p style={s.payTitle}>Online Payment (QR)</p>
                  <p style={s.payHint}>Scan the QR code and pay from your app.Make sure you login with your valide details</p>
                </div>
              </label>

              {paymentMethod === "online" && (
                <div style={{ ...s.subBox, textAlign: "center" }}>
                  <p style={s.termsTitle}>
                    Scan and pay {money(total)}
                  </p>

                  {qrMissing ? (
                    <div style={s.qrPlaceholder}>QR code coming soon</div>
                  ) : (
                    <img
                      src={QR_IMAGE}
                      alt="Payment QR code"
                      style={s.qrImage}
                      onError={() => setQrMissing(true)}
                    />
                  )}

                  <p style={s.payHint}>
                    After paying, click Place Order. We will check your payment
                    and confirm your order.Thank you for choosing us .
                  </p>

                  <input
                    style={{ ...s.input, marginTop: 12 }}
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Transaction ID (optional)"
                    maxLength={100}
                  />
                </div>
              )}
            </section>
          </div>

          {/* ───────── RIGHT SIDE: BILL ───────── */}
          <aside style={s.summary}>
            <h2 style={s.summaryTitle}>Final bill</h2>

            {items.map((item) => (
              <div key={item.id} style={s.billRow}>
                <span style={s.billName}>
                  {item.product_name} x {item.quantity}
                </span>
                <span>Rs. {item.total_amount}</span>
              </div>
            ))}

            <div style={s.divider} />

            <div style={s.billRow}>
              <span style={s.muted}>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            <div style={s.billRow}>
              <span style={s.muted}>Delivery fee</span>
              <span>{money(DELIVERY_FEE)}</span>
            </div>

            <div style={s.divider} />

            <div style={{ ...s.billRow, fontWeight: 700, fontSize: 18 }}>
              <span>Total</span>
              <span>{money(total)}</span>
            </div>

            {submitError && <p style={s.submitError}>{submitError}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...s.placeBtn,
                ...(canSubmit ? {} : s.placeBtnDisabled),
              }}
            >
              {submitting ? "Placing order…" : "Place Order"}
            </button>

            {paymentMethod === "" && (
              <p style={s.hintText}>Choose a payment method to continue.</p>
            )}
            {paymentMethod === "cod" && !termsAccepted && (
              <p style={s.hintText}>Accept the terms to place your order.</p>
            )}

            <button
              type="button"
              style={s.continueBtn}
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </aside>

        </form>
      </div>

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
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: "0 0 28px",
    paddingBottom: 16,
    borderBottom: "1px solid #e5e7eb",
  },

  layout: { display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" },
  left: {
    flex: "1 1 0",
    minWidth: 300,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  box: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 22,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  boxTitle: { fontSize: 17, fontWeight: 700, margin: "0 0 16px" },

  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  itemName: { margin: 0, fontWeight: 600, fontSize: 15 },
  itemMeta: { margin: "3px 0 0", fontSize: 13, color: "#6b7280" },
  itemTotal: { margin: 0, fontWeight: 700, fontSize: 15, color: "#2563eb" },
  linkBtn: {
    marginTop: 12,
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },

  label: {
    display: "block",
    margin: "12px 0 6px",
    fontSize: 14,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 15,
    fontFamily: "inherit",
  },

  payOption: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 12,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    cursor: "pointer",
  },
  payOptionActive: { borderColor: "#2563eb", background: "#eff6ff" },
  payTitle: { margin: 0, fontWeight: 700, fontSize: 15 },
  payHint: { margin: "3px 0 0", fontSize: 13, color: "#6b7280" },

  subBox: {
    margin: "-2px 0 14px",
    padding: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
  },
  termsTitle: { margin: "0 0 8px", fontWeight: 700, fontSize: 15 },
  termsList: {
    margin: "0 0 12px",
    paddingLeft: 20,
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 1.6,
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },

  qrImage: {
    width: 220,
    maxWidth: "100%",
    height: "auto",
    margin: "8px auto 12px",
    display: "block",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#fff",
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    maxWidth: "100%",
    margin: "8px auto 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #9ca3af",
    borderRadius: 10,
    color: "#6b7280",
    fontSize: 14,
  },

  summary: {
    width: 330,
    minWidth: 280,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 20,
  },
  summaryTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 18px" },
  billRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  billName: { color: "#374151", flex: 1 },
  divider: { borderTop: "1px solid #e5e7eb", margin: "14px 0" },

  submitError: {
    margin: "10px 0 0",
    padding: "10px 12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    color: "#dc2626",
    fontSize: 14,
  },
  placeBtn: {
    width: "100%",
    padding: 13,
    marginTop: 14,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  placeBtnDisabled: { background: "#9ca3af", cursor: "not-allowed" },
  hintText: { margin: "8px 0 0", fontSize: 13, color: "#6b7280", textAlign: "center" },
  continueBtn: {
    width: "100%",
    padding: 11,
    marginTop: 12,
    background: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
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
  emptyText: { fontSize: 18, color: "#6b7280", margin: 0 },
  muted: { color: "#6b7280", fontSize: 14 },
  errorText: { color: "#dc2626", fontSize: 15 },
};

export default Checkout;
