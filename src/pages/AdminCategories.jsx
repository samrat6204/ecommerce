import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

const API_URL = "http://127.0.0.1:8000";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// turns Django error replies into one readable message
function errorText(data) {
  if (!data) return "Something went wrong.";
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  return Object.values(data).flat().join(" ");
}

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    getCategories();
  }, []);

  async function getCategories() {
    try {
      const response = await fetch(`${API_URL}/categories/`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      setCategories(await response.json());
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setEditId(null);
  }

  // ADD or UPDATE
  async function saveCategory(event) {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const url = editId
      ? `${API_URL}/categories/${editId}/`
      : `${API_URL}/categories/`;

    try {
      const response = await fetch(url, {
        method: editId ? "PATCH" : "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "ok", text: data.message });
        resetForm();
        getCategories();
      } else {
        setMessage({ type: "error", text: errorText(data) });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Could not reach the server." });
    }
  }

  function startEdit(category) {
    setEditId(category.id);
    setName(category.name);
    setDescription(category.description);
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // DELETE
  async function deleteCategory(category) {
    if (!window.confirm(`Delete "${category.name}"?`)) return;
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${API_URL}/categories/${category.id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "ok", text: data.message });
        if (editId === category.id) resetForm();
        getCategories();
      } else {
        setMessage({ type: "error", text: errorText(data) });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Could not reach the server." });
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .category-container { max-width: 1200px; margin: auto; padding: 40px 20px; font-family: Arial, sans-serif; }
        .main-title { text-align: center; font-size: 32px; margin-bottom: 30px; }
        .category-form { max-width: 600px; margin: 0 auto 30px auto; padding: 25px; border: 1px solid #ddd; border-radius: 10px; background: #f9f9f9; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: bold; margin-bottom: 8px; }
        .form-input, .form-textarea { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; }
        .form-textarea { min-height: 100px; resize: vertical; }
        .btn-row { display: flex; gap: 10px; }
        .btn { flex: 1; padding: 12px; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; color: white; }
        .btn-primary { background: #2563eb; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-gray { background: #6b7280; }
        .msg { max-width: 600px; margin: 0 auto 25px auto; padding: 12px; border-radius: 6px; text-align: center; }
        .msg.ok { background: #dcfce7; color: #166534; }
        .msg.error { background: #fee2e2; color: #991b1b; }
        .list-title { text-align: center; font-size: 26px; margin-bottom: 25px; }
        .category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .category-card { border: 1px solid #ddd; border-radius: 10px; padding: 20px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .category-card.editing { border-color: #2563eb; }
        .category-card h3 { margin-top: 0; font-size: 20px; }
        .category-card p { color: #555; line-height: 1.5; }
        .card-actions { display: flex; gap: 10px; margin-top: 15px; }
        .small-btn { flex: 1; padding: 8px; border: none; border-radius: 5px; color: white; font-weight: bold; cursor: pointer; }
        .edit-btn { background: #f59e0b; }
        .delete-btn { background: #dc2626; }
        .no-category { text-align: center; color: #777; font-size: 18px; }
        @media (max-width: 900px) { .category-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .category-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="category-container">
        <h1 className="main-title">Manage Categories</h1>

        <form onSubmit={saveCategory} className="category-form">
          <div className="form-group">
            <label>Category Name</label>
            <input
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label>Category Description</label>
            <textarea
              placeholder="Enter category description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              maxLength={100}
              required
            />
          </div>

          <div className="btn-row">
            <button type="submit" className="btn btn-primary">
              {editId ? "Update Category" : "Add Category"}
            </button>
            {editId && (
              <button type="button" className="btn btn-gray" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message.text && <div className={`msg ${message.type}`}>{message.text}</div>}

        <h2 className="list-title">Category List</h2>

        {categories.length === 0 ? (
          <p className="no-category">No categories found.</p>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-card ${editId === category.id ? "editing" : ""}`}
              >
                <h3>{category.name}</h3>
                <p>{category.description}</p>

                <div className="card-actions">
                  <button className="small-btn edit-btn" onClick={() => startEdit(category)}>
                    Edit
                  </button>
                  <button className="small-btn delete-btn" onClick={() => deleteCategory(category)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminCategories;