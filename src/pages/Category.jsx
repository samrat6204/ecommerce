import { useEffect, useState } from "react";
import { isAdmin, getToken } from "../utils/auth";

const API_URL = "http://127.0.0.1:8000";

function Category() {
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // add form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState("");

  const admin = isAdmin();

  // ── fetch categories ─────────────────────────────────────
  async function getCategories() {
    try {
      const res = await fetch(`${API_URL}/categories/`);
      if (!res.ok) throw new Error("Failed to fetch");
      setCategories(await res.json());
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { getCategories(); }, []);

  // ── add category ─────────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAdding(true);

    try {
      const res = await fetch(`${API_URL}/categories/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.name?.[0] || data.description?.[0] || data.error || "Could not add category."
        );
        return;
      }

      setSuccess(`"${data.category.name}" added successfully!`);
      setName("");
      setDescription("");
      getCategories();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setAdding(false);
    }
  }

  // ── delete category ──────────────────────────────────────
  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Delete category "${category.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(category.id);

    try {
      const res = await fetch(`${API_URL}/categories/${category.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not delete category.");
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setSuccess(`"${category.name}" deleted.`);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .cat-page {
          max-width: 1200px;
          margin: auto;
          padding: 40px 20px;
          font-family: Arial, sans-serif;
        }

        .cat-page-title {
          text-align: center;
          font-size: 32px;
          margin: 0 0 6px;
        }

        .admin-note {
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 28px;
        }

        /* ── add form ── */
        .add-form {
          max-width: 560px;
          margin: 0 auto 40px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 28px;
        }

        .add-form h2 {
          margin: 0 0 20px;
          font-size: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 11px 13px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          font-size: 15px;
          font-family: Arial, sans-serif;
          background: white;
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .add-btn {
          width: 100%;
          padding: 12px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 7px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-btn:hover:not(:disabled) { background: #1d4ed8; }
        .add-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── banners ── */
        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .success-banner {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .banner-close {
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 16px;
          line-height: 1;
        }

        /* ── grid ── */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .category-card {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 20px;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .category-card h3 {
          margin: 0;
          font-size: 18px;
          color: #111;
        }

        .category-card p {
          margin: 0;
          color: #6b7280;
          line-height: 1.5;
          font-size: 14px;
          flex: 1;
        }

        .delete-btn {
          margin-top: 12px;
          width: 100%;
          padding: 9px;
          border: 1px solid #fecaca;
          border-radius: 7px;
          background: #fff5f5;
          color: #dc2626;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.2s;
        }

        .delete-btn:hover:not(:disabled) { background: #fee2e2; }
        .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .no-category {
          text-align: center;
          color: #777;
          font-size: 18px;
        }

        @media (max-width: 900px) {
          .category-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .category-grid { grid-template-columns: 1fr; }
          .cat-page-title { font-size: 26px; }
        }
      `}</style>

      <div className="cat-page">

        <h1 className="cat-page-title">Categories</h1>

        {admin && (
          <p className="admin-note">
            🔑 Logged in as admin — you can add and delete categories.
          </p>
        )}

        {/* ── error / success banners ── */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button className="banner-close" onClick={() => setError("")} style={{ color: "#dc2626" }}>✕</button>
          </div>
        )}

        {success && (
          <div className="success-banner">
            <span>{success}</span>
            <button className="banner-close" onClick={() => setSuccess("")} style={{ color: "#16a34a" }}>✕</button>
          </div>
        )}

        {/* ── add form — admin only ── */}
        {admin && (
          <form className="add-form" onSubmit={handleAdd}>
            <h2>➕ Add New Category</h2>

            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Electronics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-textarea"
                placeholder="Short description of this category"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="add-btn" disabled={adding}>
              {adding ? "Adding…" : "Add Category"}
            </button>
          </form>
        )}

        {/* ── category list ── */}
        <h2 style={{ textAlign: "center", fontSize: 24, marginBottom: 20 }}>
          Category List
        </h2>

        {categories.length === 0 ? (
          <p className="no-category">No categories found.</p>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">

                <h3>{category.name}</h3>
                <p>{category.description}</p>

                {admin && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(category)}
                    disabled={deletingId === category.id}
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                    </svg>
                    {deletingId === category.id ? "Deleting…" : "Delete"}
                  </button>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}

export default Category;
