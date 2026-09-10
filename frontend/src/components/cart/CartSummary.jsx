import { Link } from "react-router-dom";

const CartSummary = ({ totalPrice }) => {
  const shipping = totalPrice > 999 ? 0 : 79;
  const total = totalPrice + shipping;

  return (
    <div className="border border-sand p-6">
      <h3 className="font-display text-lg text-ink mb-5">Order Summary</h3>

      <div className="space-y-3 text-sm mb-5">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>₹{totalPrice}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
        </div>
      </div>

      <div className="flex justify-between text-ink font-medium border-t border-sand pt-4 mb-6">
        <span>Total</span>
        <span>₹{total}</span>
      </div>

      <Link
        to="/checkout"
        className="block text-center bg-ink text-ivory py-3 hover:bg-crimson transition-colors"
      >
        Checkout
      </Link>
    </div>
  );
};

export default CartSummary;