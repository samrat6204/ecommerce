import { useState } from "react";

function ProductCard({ product }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);

    setTimeout(() => setAdded(false), 1800);
  };

 

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

       

        {/* Wishlist */}
        <button
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-black hover:text-white"
          aria-label="Add to wishlist"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col p-4">

        {/* Category */}
        <span className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
          Electronics
        </span>

        {/* Product Name */}
        <h2 className="mb-1 truncate text-base font-semibold text-black">
          {product.name}
        </h2>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {product.description}
        </p>

        {/* Price & Button */}
        <div className="flex items-center justify-between gap-3">

          <div>
            <p className="text-lg font-bold text-black">
              Rs. {product.price}
            </p>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAdd}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              added
                ? "bg-gray-200 text-black"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {added ? (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Added
              </>
            ) 
            : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 9M17 13l2.3 9M9 22h6"
                  />
                </svg>
                Add to Cart
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

export default ProductCard;