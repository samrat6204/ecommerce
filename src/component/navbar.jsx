import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("access_token"));
  const [cartCount, setCartCount] = useState(0);

  // Fetch item count for the badge whenever the user is logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchCount() {
      try {
        const cartId = localStorage.getItem("cart_id");
        if (!cartId) return;

        const res = await fetch(`${API_URL}/cart/${cartId}/`);
        if (!res.ok) return;

        const data = await res.json();
        setCartCount(data.cart_details?.length ?? 0);
      } catch {
        // silently ignore — badge just won't show
      }
    }

    fetchCount();

    // Refresh badge every time the window regains focus (user comes back from cart page)
    window.addEventListener("focus", fetchCount);
    return () => window.removeEventListener("focus", fetchCount);
  }, [isLoggedIn]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart_id");
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <>
      <style>{`
        .navbar {
          border-bottom: 1px solid #e5e7eb;
          background-color: white;
        }

        .navbar-container {
          max-width: 1200px;
          margin: auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          text-decoration: none;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-link {
          padding: 10px 16px;
          border-radius: 6px;
          color: #374151;
          text-decoration: none;
          transition: 0.3s;
        }

        .nav-link:hover {
          background-color: #f3f4f6;
        }

        .nav-link.active {
          background-color: #2563eb;
          color: white;
        }

        .cart-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: 6px;
          color: #374151;
          text-decoration: none;
          transition: 0.3s;
        }

        .cart-link:hover {
          background-color: #f3f4f6;
        }

        .cart-link.active {
          background-color: #2563eb;
          color: white;
        }

        .cart-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: #dc2626;
          color: white;
          font-size: 11px;
          font-weight: 700;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .logout-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          background-color: #dc2626;
          color: white;
          cursor: pointer;
          transition: 0.3s;
          font-size: 16px;
        }

        .logout-btn:hover {
          background-color: #b91c1c;
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-container">

          <NavLink
            to={isLoggedIn ? "/products" : "/login"}
            className="logo"
          >
            MyApp
          </NavLink>

          <div className="nav-menu">

            {!isLoggedIn ? (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>

                <NavLink to="/register" className={linkClass}>
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/products" className={linkClass}>
                  Products
                </NavLink>

                <NavLink to="/category" className={linkClass}>
                  Categories
                </NavLink>

                <NavLink to="/add-product" className={linkClass}>
                  Add Product
                </NavLink>

                {/* Cart with badge */}
                <NavLink to="/cart" className={({ isActive }) =>
                  isActive ? "cart-link active" : "cart-link"
                }>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 9M17 13l2.3 9M9 22h6" />
                  </svg>
                  Cart
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Logout
                </button>
              </>
            )}

          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
