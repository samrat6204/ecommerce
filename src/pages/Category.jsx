import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function Category() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function getCategories() {
      try {
        const response = await fetch(`${API_URL}/categories/`);

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        setCategories(await response.json());
      } catch (error) {
        console.error("Error:", error);
      }
    }

    getCategories();
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .category-container { max-width: 1200px; margin: auto; padding: 40px 20px; font-family: Arial, sans-serif; }
        .list-title { text-align: center; font-size: 32px; margin-bottom: 25px; }
        .category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .category-card { border: 1px solid #ddd; border-radius: 10px; padding: 20px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .category-card h3 { margin-top: 0; font-size: 20px; }
        .category-card p { color: #555; line-height: 1.5; }
        .no-category { text-align: center; color: #777; font-size: 18px; }
        @media (max-width: 900px) { .category-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .category-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="category-container">
        <h1 className="list-title">Category List</h1>

        {categories.length === 0 ? (
          <p className="no-category">No categories found.</p>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Category;