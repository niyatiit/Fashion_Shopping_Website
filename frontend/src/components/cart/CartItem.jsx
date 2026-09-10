import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";

const CartItem = ({ item }) => {
  const { updateCartItem, removeCartItem } = useCart();

  return (
    <div className="flex gap-5 py-6 border-b border-sand">
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
          <p className="text-ink font-medium mt-1">₹{item.price}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center border border-sand">
            <button
              onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))}
              className="w-8 h-8 text-ink hover:bg-sand transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => updateCartItem(item._id, item.quantity + 1)}
              className="w-8 h-8 text-ink hover:bg-sand transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeCartItem(item._id)}
            className="text-sm text-muted hover:text-crimson transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="text-ink font-medium">₹{item.price * item.quantity}</p>
    </div>
  );
};

export default CartItem;