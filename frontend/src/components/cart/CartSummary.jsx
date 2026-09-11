import { useState } from "react";
import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";

const CartSummary = ({ totalPrice, hasStockIssue }) => {
  const { appliedCoupon, couponLoading, couponError, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");

  const shipping = totalPrice > 999 ? 0 : 79;
  const discount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(totalPrice - discount, 0) + shipping;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput("");
    } catch {
      // couponError is already set inside the context
    }
  };

  return (
    <div className="border border-sand p-6 h-fit">
      <h3 className="font-display text-lg text-ink mb-5">Order Summary</h3>

      {/* Coupon */}
      <div className="mb-5">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-sand/40 px-3 py-2.5 text-sm">
            <span className="text-ink">
              <span className="text-crimson">{appliedCoupon.code}</span> applied
            </span>
            <button onClick={removeCoupon} className="text-muted hover:text-crimson transition-colors">
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 min-w-0 border border-sand px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-muted/60 focus:outline-none focus:border-crimson"
            />
            <button
              type="submit"
              disabled={couponLoading || !couponInput.trim()}
              className="border border-ink px-4 text-sm text-ink hover:bg-ink hover:text-ivory transition-colors disabled:opacity-50 shrink-0"
            >
              {couponLoading ? "..." : "Apply"}
            </button>
          </form>
        )}
        {couponError && <p className="text-xs text-crimson mt-2">{couponError}</p>}
      </div>

      <div className="space-y-3 text-sm mb-5">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-crimson">
            <span>Discount</span>
            <span>−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
        </div>
      </div>

      <div className="flex justify-between text-ink font-medium border-t border-sand pt-4 mb-6">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      {hasStockIssue && (
        <p className="text-xs text-crimson mb-3 text-center">
          Resolve the stock issues in your bag before checking out.
        </p>
      )}

      {hasStockIssue ? (
        <button
          disabled
          className="block w-full text-center bg-sand text-muted py-3 cursor-not-allowed"
        >
          Checkout
        </button>
      ) : (
        <Link
          to="/checkout"
          className="block text-center bg-ink text-ivory py-3 hover:bg-crimson transition-colors"
        >
          Checkout
        </Link>
      )}

      <Link
        to="/products"
        className="block text-center text-sm text-muted hover:text-ink transition-colors mt-4"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default CartSummary;