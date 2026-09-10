import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";

const Cart = () => {
  const { cart, loading } = useCart();

  if (loading) return <p className="text-center text-muted py-20">Loading...</p>;

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">Your Bag</h1>

      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <div>
          {cart.items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>
        <CartSummary totalPrice={cart.totalPrice} />
      </div>
    </div>
  );
};

export default Cart;