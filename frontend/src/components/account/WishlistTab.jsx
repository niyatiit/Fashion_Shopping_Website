import { Link } from "react-router-dom";
import useWishlist from "../../hooks/useWishlist";

const WishlistTab = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-8">Wishlist</h2>
      {wishlist.products.length === 0 ? (
        <p className="text-sm text-muted">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.products.map((product) => (
            <div key={product._id}>
              <Link to={`/products/${product._id}`}>
                <div className="aspect-[3/4] bg-sand overflow-hidden mb-2">
                  <img src={product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-ink">{product.name}</p>
                <p className="text-sm text-ink font-medium">
                  ₹{product.discountPrice > 0 ? product.discountPrice : product.price}
                </p>
              </Link>
              <button onClick={() => removeFromWishlist(product._id)} className="text-sm text-muted hover:text-crimson transition-colors mt-1">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistTab;