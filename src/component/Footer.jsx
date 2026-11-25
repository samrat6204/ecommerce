import { Link } from "react-router-dom";

function Footer() {
  return (
    <>
      <style>{`
        .footer {
          background-color: #111827;
          color: #d1d5db;
          font-family: Arial, sans-serif;
          margin-top: auto;
        }

        .footer-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 48px 24px 32px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        .footer-brand h2 {
          color: #ffffff;
          font-size: 26px;
          margin: 0 0 10px;
        }

        .footer-brand p {
          font-size: 16px;
          line-height: 1.7;
          color: #9ca3af;
          margin: 0;
        }

        .footer-col h3 {
          color: #ffffff;
          font-size: 16px;
          font-weight: 800;
          margin: 0 0 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-col ul li a {
          color: #9ca3af;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .footer-col ul li a:hover {
          color: #ffffff;
        }

        .footer-col p {
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.8;
          margin: 0 0 8px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .footer-bottom {
          border-top: 1px solid #1f2937;
          padding: 20px 24px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }

        @media (max-width: 900px) {
          .footer-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 540px) {
          .footer-container {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-container">

          {/* ── Brand ── */}
          <div className="footer-brand">
            <h2>Saauzi</h2>
            <p>
              Your one-stop shop for quality products.
              Fast delivery, great prices, and excellent service.
            </p>
          </div>

          {/* ── Quick Links ── */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/products">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/category">Categories</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/checkout">Checkout</Link></li>
            </ul>
          </div>

          {/* ── About Us ── */}
          <div className="footer-col">
            <h3>About Us</h3>
            <ul>
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* ── Contact & Location ── */}
          <div className="footer-col">
            <h3>Contact Us</h3>

            <p>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Pokhara, Nepal
            </p>

            <p>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              saauzi@gmail.com
            </p>

            <p>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +977 980-0000000
            </p>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} @Saauzi. All rights reserved. &nbsp;|&nbsp; Pokhara, Nepal
        </div>
      </footer>
    </>
  );
}

export default Footer;
