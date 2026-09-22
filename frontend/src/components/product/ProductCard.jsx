import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";
import { formatPrice, getDiscountPercent } from "../../utils/formatPrice";

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 20 20"
    fill={filled ? "#8C1D18" : "none"}
    stroke="#8C1D18"
    strokeWidth="1"
    className="w-3.5 h-3.5"
  >
    <path d="M10 1l2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.2l6.1-.6L10 1z" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "#8C1D18" : "none"}
    stroke={filled ? "#8C1D18" : "#161412"}
    strokeWidth="1.5"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.5 5.6 4a5 5 0 016.4 2.3A5 5 0 0118.4 4c3.6.5 5.2 4.2 3.6 7.7C19.5 16.4 12 21 12 21z"
    />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 01-8 0" />
  </svg>
);

// showActions: set false to render a bare card with no wishlist/cart overlay (e.g. dense admin previews)
const ProductCard = ({ product, showActions = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const hasDiscount = product.discountPrice > 0;
  const discountPercent = getDiscountPercent(product.price, product.discountPrice);
  const inWishlist = isInWishlist(product._id);
  const outOfStock = product.stock === 0;

  const requireAuth = () => {
    if (!user) {
      navigate("/login");
      return true;
    }
    return false;
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireAuth()) return;
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireAuth()) return;
    if (outOfStock || adding) return;
    try {
      setAdding(true);
      await addToCart(product._id, 1, product.sizes?.[0]);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="relative aspect-[3/4] bg-sand overflow-hidden mb-3">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 bg-crimson text-ivory text-xs px-2 py-1">
            -{discountPercent}%
          </span>
        )}

        {outOfStock && (
          <span className="absolute top-2.5 right-2.5 bg-ink/90 text-ivory text-xs px-2 py-1">
            Sold out
          </span>
        )}

        {showActions && (
          <>
            <button
              onClick={handleWishlistToggle}
              aria-label="Toggle wishlist"
              className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-ivory/95 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <HeartIcon filled={inWishlist} />
            </button>

            <button
              onClick={handleQuickAdd}
              disabled={outOfStock || adding}
              aria-label="Add to bag"
              className="absolute bottom-2.5 left-2.5 right-12 h-8 bg-ink/95 text-ivory text-xs flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-crimson"
            >
              <BagIcon />
              {justAdded ? "Added" : adding ? "Adding..." : "Quick Add"}
            </button>
          </>
        )}
      </div>

      <h3 className="text-sm text-ink mb-0.5 truncate">{product.name}</h3>

      {product.fabric && (
        <p className="text-[11px] text-muted tracking-wide mb-1 flex items-center gap-1 font-sans">
          <span className="opacity-70 text-[10px]">🧵</span>
          <span className="capitalize">{product.fabric}</span>
        </p>
      )}

      {product.numReviews > 0 && (
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} filled={star <= Math.round(product.ratings)} />
          ))}
          <span className="text-xs text-muted ml-1">({product.numReviews})</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        {hasDiscount ? (
          <>
            <span className="text-crimson font-medium">{formatPrice(product.discountPrice)}</span>
            <span className="text-muted line-through text-xs">{formatPrice(product.price)}</span>
          </>
        ) : (
          <span className="text-ink font-medium">{formatPrice(product.price)}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;