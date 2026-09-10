import {
  NavLink,
  useNavigate,
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  // Check login status
  const isLoggedIn = Boolean(
    localStorage.getItem("access_token")
  );

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

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
            to={isLoggedIn ? "/dashboard" : "/login"}
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
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>

                <NavLink to="/products" className={linkClass}>
                  Products
                </NavLink>

                <NavLink to="/Category" className={linkClass}>
                  Categories
                </NavLink>

                <NavLink to="/add-product" className={linkClass}>
                  Add Product
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