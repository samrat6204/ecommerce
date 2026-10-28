import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { API_URL, getToken, flattenErrors, money } from "../cartApi";

function OrderSuccess() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  // sent from the Checkout page (only exists right after placing the order)
  const emailSent = location.state?.emailSent;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : { error: `Server error (${res.status})` };

        if (!res.ok) throw new Error(flattenErrors(data));

        setOrder(data);
      } catch (err) {
        setError(err.message || "Could not load your order.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div style={s.center}>
        <p style={s.muted}>Loading your order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={s.center}>
        <p style={s.errorText}>{error || "Order not found."}</p>
        <button style={s.primaryBtn} onClick={() => navigate("/products")}>
          Back to products
        </button>
      </div>
    );
  }

  const isOnline = order.payment_method === "online";

  return (
    <main style={s.page}>
      <div style={s.card}>

        <div style={s.iconWrap}>
          <svg width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 style={s.title}>Order placed!</h1>
        <p style={s.orderNo}>Order number: {order.order_number}</p>

        {isOnline ? (
          <p style={s.note}>
            We received your order. We will confirm it after we verify your
            QR payment.
          </p>
        ) : (
          <p style={s.note}>
            Please keep {money(order.total)} ready. You will pay cash when your
            order arrives.
          </p>
        )}

        {emailSent === true && (
          <p style={s.good}>A confirmation email has been sent to you.</p>
        )}
        {emailSent === false && (
          <p style={s.warn}>
            Your order is saved, but we could not send the confirmation email.
          </p>
        )}

        {/* items */}
        <div style={s.section}>
          {order.items.map((item) => (
            <div key={item.id} style={s.row}>
              <span>
                {item.product_name} x {item.quantity}
              </span>
              <span>Rs. {item.total_amount}</span>
            </div>
          ))}

          <div style={s.divider} />

          <div style={s.row}>
            <span style={s.muted}>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div style={s.row}>
            <span style={s.muted}>Delivery fee</span>
            <span>{money(order.delivery_fee)}</span>
          </div>
          <div style={{ ...s.row, fontWeight: 700, fontSize: 17 }}>
            <span>Total</span>
            <span>{money(order.total)}</span>
          </div>
        </div>

        {/* delivery + payment */}
        <div style={s.section}>
          <div style={s.row}>
            <span style={s.muted}>Payment</span>
            <span>{order.payment_method_label}</span>
          </div>
          <div style={s.row}>
            <span style={s.muted}>Payment status</span>
            <span style={{ textTransform: "capitalize" }}>{order.payment_status}</span>
          </div>
          <div style={s.row}>
            <span style={s.muted}>Deliver to</span>
            <span style={{ textAlign: "right", maxWidth: 220 }}>
              {order.full_name}, {order.address}
            </span>
          </div>
          <div style={s.row}>
            <span style={s.muted}>Phone</span>
            <span>{order.phone_number}</span>
          </div>
        </div>

        <button style={s.primaryBtn} onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </div>
    </main>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "40px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
  },
  iconWrap: {
    width: 68,
    height: 68,
    margin: "0 auto 16px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { margin: "0 0 6px", fontSize: 28 },
  orderNo: { margin: "0 0 14px", fontWeight: 700, color: "#2563eb", fontSize: 16 },
  note: { margin: "0 0 10px", color: "#4b5563", fontSize: 15, lineHeight: 1.5 },
  good: { margin: "0 0 10px", color: "#16a34a", fontSize: 14 },
  warn: { margin: "0 0 10px", color: "#b45309", fontSize: 14 },

  section: {
    margin: "20px 0",
    padding: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    textAlign: "left",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
    fontSize: 14,
  },
  divider: { borderTop: "1px solid #e5e7eb", margin: "10px 0" },

  primaryBtn: {
    width: "100%",
    padding: 13,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
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
  muted: { color: "#6b7280", fontSize: 14 },
  errorText: { color: "#dc2626", fontSize: 15 },
};

export default OrderSuccess;
