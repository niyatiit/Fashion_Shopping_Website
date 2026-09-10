import { Link } from "react-router-dom";
import useWishlist from "../hooks/useWishlist";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

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
              <div className="aspect-[3/4] bg-sand overflow-hidden mb-3">
                <img
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-sm text-ink mb-1">{product.name}</h3>
              <p className="text-sm text-ink font-medium">
                ₹{product.discountPrice > 0 ? product.discountPrice : product.price}
              </p>
            </Link>
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