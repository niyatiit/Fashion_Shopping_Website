import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const statusBadges = {
  Processing: "bg-amber-50 text-amber-800 border-amber-200",
  Shipped: "bg-blue-50 text-blue-800 border-blue-200",
  "Out for Delivery": "bg-purple-50 text-purple-800 border-purple-200",
  Delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-800 border-rose-200",
};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      const { data } = await axiosInstance.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError("Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await axiosInstance.put(`/orders/${id}/cancel`);
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getProductTitle = () => {
    if (!order?.orderItems || order.orderItems.length === 0) {
      return "Fashion Order";
    }
    const names = order.orderItems.map((i) => i.name).filter(Boolean);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names[0]}, ${names[1]} & ${names.length - 2} more item${names.length - 2 > 1 ? "s" : ""}`;
  };

  if (loading)
    return <p className="text-center text-muted py-20">Loading...</p>;
  if (error || !order)
    return <p className="text-center text-muted py-20">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        to="/orders"
        className="text-sm text-muted hover:text-crimson transition-colors"
      >
        ← Back to orders
      </Link>

      <div className="flex justify-between items-start mt-6 mb-10">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1 font-medium">
            {getProductTitle()}
          </h1>
          <p className="text-sm text-muted">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full border font-medium ${
            statusBadges[order.orderStatus] || "bg-sand/40 text-ink border-sand"
          }`}
        >
          ● {order.orderStatus}
        </span>
      </div>

      {/* Items */}
      <div className="mb-10">
        {order.orderItems.map((item, i) => (
          <div key={i} className="flex gap-5 py-5 border-b border-sand">
            <div className="w-20 h-28 bg-sand shrink-0 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-ink">{item.name}</p>
              <p className="text-sm text-muted mt-1">
                {item.size && `Size: ${item.size}`}{" "}
                {item.color && `· ${item.color}`} · Qty: {item.quantity}
              </p>
              <p className="text-ink font-medium mt-1">
                ₹{item.price * item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping + Payment */}
      <div className="grid md:grid-cols-2 gap-10 mb-10">
        <div>
          <h2 className="font-display text-lg text-ink mb-3">
            Shipping Address
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.state} - {order.shippingAddress.pincode}
            <br />
            {order.shippingAddress.country} · {order.shippingAddress.phone}
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Payment</h2>
          <p className="text-sm text-muted">
            Method:{" "}
            {order.paymentMethod === "COD"
              ? "Cash on Delivery"
              : order.paymentMethod === "UPI"
              ? "Paid via UPI"
              : "Paid Online"}
            <br />
            Status: {order.isPaid ? "Paid" : "Pending"}
          </p>
        </div>
      </div>

      {/* Price summary */}
      <div className="border-t border-sand pt-6 space-y-2 mb-8">
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span>₹{order.itemsPrice}</span>
        </div>
        <div className="flex justify-between text-sm text-muted">
          <span>Shipping</span>
          <span>
            {order.shippingPrice === 0 ? "Free" : `₹${order.shippingPrice}`}
          </span>
        </div>
        <div className="flex justify-between text-ink font-medium text-lg pt-2 border-t border-sand">
          <span>Total</span>
          <span>₹{order.totalPrice}</span>
        </div>
      </div>

      {order.orderStatus === "Processing" && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="border border-crimson text-crimson px-6 py-2.5 hover:bg-crimson hover:text-ivory transition-colors disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      )}
    </div>
  );
};

export default OrderDetails;
