import ProductCard from "../component/productcard";
import products from "../data/product";

function ProductPage() {
  return (
    <div className="min-h-screen bg-white text-black">

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Toolbar */}
        <div className="mb-8 border-b border-gray-200 pb-5">
          <h2 className="text-lg font-semibold">
            All Products
          </h2>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

      </main>

    </div>
  );
}

export default ProductPage;