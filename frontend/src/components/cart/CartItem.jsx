import { useState } from "react";
import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";

const CartItem = ({ item }) => {
  const { updateCartItem, removeCartItem } = useCart();
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [itemError, setItemError] = useState("");

  const stock = item.product?.stock ?? 0;
  const outOfStock = stock === 0;
  const exceedsStock = !outOfStock && item.quantity > stock;
  const lowStock = !outOfStock && !exceedsStock && stock <= 5;

  const handleQuantityChange = async (nextQuantity) => {
    if (nextQuantity < 1 || nextQuantity > stock || updating) return;
    try {
      setUpdating(true);
      setItemError("");
      await updateCartItem(item._id, nextQuantity);
    } catch (err) {
      setItemError(err.response?.data?.message || "Could not update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);
      await removeCartItem(item._id);
    } catch (err) {
      setItemError(err.response?.data?.message || "Could not remove item");
      setRemoving(false);
    }
  };

  return (
    <div className={`flex gap-5 py-6 border-b border-sand ${removing ? "opacity-40 pointer-events-none" : ""}`}>
      <Link to={`/products/${item.product._id}`} className="w-24 h-32 bg-sand shrink-0 overflow-hidden">
        <img
          src={item.product.images?.[0]?.url}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${item.product._id}`} className="text-ink hover:text-crimson transition-colors">
            {item.product.name}
          </Link>
          <p className="text-sm text-muted mt-1">
            {item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`}
          </p>
          <p className="text-ink font-medium mt-1">{formatPrice(item.price)}</p>

          {outOfStock && (
            <p className="text-xs text-crimson mt-2">
              This item is now out of stock — please remove it to continue.
            </p>
          )}
          {exceedsStock && (
            <p className="text-xs text-crimson mt-2">
              Only {stock} left in stock — reduce the quantity to continue.
            </p>
          )}
          {lowStock && (
            <p className="text-xs text-muted mt-2">Only {stock} left in stock</p>
          )}
          {itemError && <p className="text-xs text-crimson mt-2">{itemError}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center border border-sand">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="w-8 h-8 text-ink hover:bg-sand transition-colors disabled:opacity-40"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{updating ? "…" : item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={updating || item.quantity >= stock}
              className="w-8 h-8 text-ink hover:bg-sand transition-colors disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="text-sm text-muted hover:text-crimson transition-colors disabled:opacity-50"
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>

      <p className="text-ink font-medium">{formatPrice(item.price * item.quantity)}</p>
    </div>
  );
};

export default CartItem;