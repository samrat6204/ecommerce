/**
 * Saauzi — Root Application Component
 * =====================================
 * This is the entry point of the React app.
 * It sets up the page layout (Navbar → page content → Footer)
 * and defines all the URL routes.
 *
 * Route structure:
 *   /              → redirects to /login
 *   /login         → Login page
 *   /register      → Register page
 *   /products      → Product listing page (all users)
 *   /category      → Category listing page (all users, delete for admin)
 *   /add-product   → Add product form (admin only)
 *   /cart          → Shopping cart page (logged-in users)
 *   /checkout      → Checkout & payment page (logged-in users)
 *   /order-success → Order confirmation page (after placing an order)
 *   /admin/categories → Admin category management (admin only)
 *
 * Authentication:
 *   - AdminRoute wrapper redirects non-admins to /login
 *   - Individual pages also check auth and redirect if needed
 */

// ─── Page imports ─────────────────────────────────────────────────────────────
import Login          from "./pages/login";
import Register       from "./pages/Register";
import ProductPage    from "./pages/Product";
import Category       from "./pages/Category";
import AddProduct     from "./pages/AddProduct";
import Cart           from "./pages/Cart";
import Checkout       from "./pages/checkout";
import OrderSuccess   from "./pages/OrderSuccess";
import AdminCategories from "./pages/AdminCategories";

// ─── Component imports ────────────────────────────────────────────────────────
import Navbar      from "./component/navbar";
import Footer      from "./component/Footer";
import AdminRoute  from "./component/AdminRoute";

// ─── Router imports ───────────────────────────────────────────────────────────
import { Navigate, Route, Routes } from "react-router-dom";


function App() {
  return (
    // Full-height flex column: Navbar at top, content in middle, Footer at bottom
    <div className="flex min-h-screen flex-col">

      {/* ── Top navigation bar (always visible) ── */}
      <Navbar />

      {/* ── Page content — grows to fill available space ── */}
      <main className="flex-1">
        <Routes>

          {/* Default route — redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Public routes (no login required) ── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Logged-in user routes ── */}
          <Route path="/products"  element={<ProductPage />} />
          <Route path="/category"  element={<Category />} />
          <Route path="/cart"      element={<Cart />} />
          <Route path="/checkout"  element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />

          {/* ── Admin only routes ── */}
          {/* AdminRoute redirects non-admins to /login */}
          <Route
            path="/add-product"
            element={
              <AdminRoute>
                <AddProduct />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />

        </Routes>
      </main>

      {/* ── Footer (always visible) ── */}
      <Footer />

    </div>
  );
}

export default App;
