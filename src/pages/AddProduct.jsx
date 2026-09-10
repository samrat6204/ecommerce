import { useEffect, useState } from "react";

function AddProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  // GET products
  const getProducts = async () => {
    const response = await fetch("http://127.0.0.1:8000/products/");
    const data = await response.json();

    setProducts(data);
  };

  // GET categories
  const getCategories = async () => {
    const response = await fetch("http://127.0.0.1:8000/categories/");
    const data = await response.json();

    setCategories(data);
  };

  useEffect(() => {
    getProducts();
    getCategories();
  }, []);

  // POST product
  const addProduct = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/products/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        category: category,
      }),
    });

    if (response.ok) {
      alert("Product added successfully");

      setName("");
      setDescription("");
      setPrice("");
      setQuantity("");
      setCategory("");

      getProducts();
    } else {
      const data = await response.json();
      console.log(data);
      alert("Failed to add product");
    }
  };

  // Look up a category's name from its id, for display in the product list
  const getCategoryName = (categoryId) => {
    const match = categories.find(
      (c) => String(c.id) === String(categoryId)
    );
    return match ? match.name : categoryId;
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .product-container {
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

        .product-form {
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
        .form-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
          background-color: white;
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

        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .product-card {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 20px;
          background-color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .product-card h3 {
          margin-top: 0;
          font-size: 20px;
        }

        .product-card p {
          color: #555;
          line-height: 1.5;
          margin: 4px 0;
        }

        .product-price {
          font-weight: bold;
          color: #2563eb;
        }

        .no-product {
          text-align: center;
          color: #777;
          font-size: 18px;
        }

        @media (max-width: 900px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .product-grid {
            grid-template-columns: 1fr;
          }

          .main-title {
            font-size: 26px;
          }
        }
      `}</style>

      <div className="product-container">

        <h1 className="main-title">
          Add Product
        </h1>

        {/* Add Product Form */}
        <form onSubmit={addProduct} className="product-form">

          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="add-button">
            Add Product
          </button>

        </form>

        {/* Display Products */}
        <h2 className="list-title">
          Product List
        </h2>

        {products.length === 0 ? (

          <p className="no-product">
            No products found.
          </p>

        ) : (

          <div className="product-grid">

            {products.map((product) => (

              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className="product-price">Price: {product.price}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Category: {getCategoryName(product.category)}</p>
              </div>

            ))}

          </div>

        )}

      </div>
    </>
  );
}

export default AddProduct;