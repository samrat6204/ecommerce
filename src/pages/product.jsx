import { useEffect, useState } from "react";
import ProductCard from "../component/productcard";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const getProducts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/products/");
      const data = await response.json();
      console.log("Products:", data);
      setProducts(data);
    } catch (error) {
      console.log("Product error:", error);
    }
  };

  const getCategories = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/categories/");
      const data = await response.json();
      console.log("Categories:", data);
      setCategories(data);
    } catch (error) {
      console.log("Category error:", error);
    }
  };

  useEffect(() => {
    getProducts();
    getCategories();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (cat) => String(cat.id) === String(categoryId)
    );
    return category ? category.name : "Category";
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 border-b border-gray-200 pb-5">
          <h2 className="text-lg font-semibold">All Products</h2>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  category_name: getCategoryName(product.category),
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductPage;