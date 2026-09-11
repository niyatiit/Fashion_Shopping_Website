import { useState } from "react";
import { Link } from "react-router-dom";
import useWishlist from "../hooks/useWishlist";
import useCart from "../hooks/useCart";
import { formatPrice } from "../utils/formatPrice";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [movingId, setMovingId] = useState(null);
  const [itemErrors, setItemErrors] = useState({});

  const handleMoveToBag = async (product) => {
    setItemErrors((prev) => ({ ...prev, [product._id]: "" }));
    try {
      setMovingId(product._id);
      // Auto-pick the first available size/color, matching quick-add elsewhere on the site
      await addToCart(product._id, 1, product.sizes?.[0], product.colors?.[0]);
      await removeFromWishlist(product._id);
    } catch (err) {
      setItemErrors((prev) => ({
        ...prev,
        [product._id]: err.response?.data?.message || "Could not move this item to your bag",
      }));
    } finally {
      setMovingId(null);
    }
  };

  if (wishlist.products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Your wishlist is empty</h1>
        <Link to="/products" className="inline-block bg-ink text-ivory px-8 py-3 hover:bg-crimson transition-colors">
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">Wishlist</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {wishlist.products.map((product) => (
          <div key={product._id} className="group">
            <Link to={`/products/${product._id}`} className="block">
              <div className="aspect-[3/4] bg-sand overflow-hidden mb-3 relative">
                <img
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.stock === 0 && (
                  <span className="absolute top-2.5 right-2.5 bg-ink/90 text-ivory text-xs px-2 py-1">
                    Sold out
                  </span>
                )}
              </div>
              <h3 className="text-sm text-ink mb-1">{product.name}</h3>
              <p className="text-sm text-ink font-medium">
                {formatPrice(product.discountPrice > 0 ? product.discountPrice : product.price)}
              </p>
            </Link>

            <button
              onClick={() => handleMoveToBag(product)}
              disabled={movingId === product._id || product.stock === 0}
              className="w-full mt-3 border border-ink text-ink text-sm py-2 hover:bg-ink hover:text-ivory transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              {product.stock === 0
                ? "Out of Stock"
                : movingId === product._id
                  ? "Moving..."
                  : "Move to Bag"}
            </button>

            {itemErrors[product._id] && (
              <p className="text-xs text-crimson mt-2">{itemErrors[product._id]}</p>
            )}

            <button
              onClick={() => removeFromWishlist(product._id)}
              className="text-sm text-muted hover:text-crimson transition-colors mt-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;