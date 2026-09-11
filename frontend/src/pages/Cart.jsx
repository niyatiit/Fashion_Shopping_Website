import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";

const CartItemSkeleton = () => (
  <div className="flex gap-5 py-6 border-b border-sand animate-pulse">
    <div className="w-24 h-32 bg-sand shrink-0" />
    <div className="flex-1 space-y-3 py-2">
      <div className="h-4 bg-sand w-1/2" />
      <div className="h-3 bg-sand w-1/4" />
      <div className="h-3 bg-sand w-1/6" />
    </div>
  </div>
);

const Cart = () => {
  const { cart, loading, error } = useCart();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl text-ink mb-10">Your Bag</h1>
        <div className="grid md:grid-cols-[1fr_320px] gap-10">
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
          <div className="h-64 bg-sand/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-crimson mb-6">{error}</p>
        <Link to="/products" className="inline-block bg-ink text-ivory px-8 py-3 hover:bg-crimson transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Your bag is empty</h1>
        <p className="text-muted mb-6">Find something you'll love.</p>
        <Link to="/products" className="inline-block bg-ink text-ivory px-8 py-3 hover:bg-crimson transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  const hasStockIssue = cart.items.some(
    (item) => (item.product?.stock ?? 0) === 0 || item.quantity > (item.product?.stock ?? 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-3xl text-ink">Your Bag</h1>
        <Link to="/products" className="text-sm text-muted hover:text-crimson transition-colors">
          ← Continue Shopping
        </Link>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <div>
          {cart.items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>
        <CartSummary totalPrice={cart.totalPrice} hasStockIssue={hasStockIssue} />
      </div>
    </div>
  );
};

export default Cart;