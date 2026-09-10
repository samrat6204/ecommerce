import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function Category() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Load categories when page opens
  useEffect(() => {
    getCategories();
  }, []);

  // GET categories
  async function getCategories() {
    try {
      const response = await fetch(`${API_URL}/categories/`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      console.log(data);

      setCategories(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // POST category
  async function addCategory(event) {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/categories/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name,
          description: description,
        }),
      });

      const data = await response.json();

      console.log("Response:", data);

      if (response.ok) {
        alert("Category added successfully.");

        // Clear input fields
        setName("");
        setDescription("");

        // Refresh category list
        getCategories();
      } else {
        console.log(data);
        alert("Could not add category.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .category-container {
          max-width: 1200px;
          margin: auto;
          padding: 40px 20px;
          font-family: Arial, sans-serif;
        }

        .main-title {
          text-align: center;
          font-size: 32px;
          margin-bottom: 30px;
        }

        .category-form {
          max-width: 600px;
          margin: 0 auto 50px auto;
          padding: 25px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background-color: #f9f9f9;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .add-button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 5px;
          background-color: #2563eb;
          color: white;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }

        .add-button:hover {
          background-color: #1d4ed8;
        }

        .list-title {
          text-align: center;
          font-size: 26px;
          margin-bottom: 25px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .category-card {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 20px;
          background-color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .category-card h3 {
          margin-top: 0;
          font-size: 20px;
        }

        .category-card p {
          color: #555;
          line-height: 1.5;
        }

        .no-category {
          text-align: center;
          color: #777;
          font-size: 18px;
        }

        @media (max-width: 900px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .category-grid {
            grid-template-columns: 1fr;
          }

          .main-title {
            font-size: 26px;
          }
        }
      `}</style>

      <div className="category-container">

        <h1 className="main-title">
          Categories
        </h1>

        {/* Category Form */}
        <form
          onSubmit={addCategory}
          className="category-form"
        >

          <div className="form-group">
            <label>Category Name</label>

            <input
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Category Description</label>

            <textarea
              placeholder="Enter category description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              className="form-textarea"
              required
            />
          </div>

          <button
            type="submit"
            className="add-button"
          >
            Add Category
          </button>

        </form>


        {/* Category List */}
        <h2 className="list-title">
          Category List
        </h2>


        {categories.length === 0 ? (

          <p className="no-category">
            No categories found.
          </p>

        ) : (

          <div className="category-grid">

            {categories.map((category) => (

              <div
                key={category.id}
                className="category-card"
              >

                <h3>
                  {category.name}
                </h3>

                <p>
                  {category.description}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>
    </>
  );
}

export default Category;