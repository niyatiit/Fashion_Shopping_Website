import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { formatPrice } from "../utils/formatPrice";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.5l2.5 2.5L16 9.5" />
  </svg>
);

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosInstance.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "We couldn't find that order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-muted">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-crimson mb-6">{error || "We couldn't find that order."}</p>
        <Link to="/orders" className="inline-block bg-ink text-ivory px-8 py-3 hover:bg-crimson transition-colors">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Success header */}
      <div className="text-center mb-14">
        <div className="w-16 h-16 rounded-full bg-sand/50 text-crimson flex items-center justify-center mx-auto mb-6">
          <CheckIcon />
        </div>
        <h1 className="font-display text-3xl text-ink mb-3">Order placed successfully!</h1>
        <p className="text-muted">
          Thank you — your order for{" "}
          <span className="text-ink font-semibold">
            {order.orderItems?.map((i) => i.name).filter(Boolean).join(", ") || "your fashion items"}
          </span>{" "}
          has been placed successfully.
        </p>
      </div>

      {/* Order meta */}
      <div className="grid sm:grid-cols-3 gap-6 border border-sand p-6 mb-10 text-sm">
        <div>
          <p className="text-muted mb-1">Order Date</p>
          <p className="text-ink">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-muted mb-1">Payment Method</p>
          <p className="text-ink">
            {order.paymentMethod === "COD"
              ? "Cash on Delivery"
              : order.paymentMethod === "UPI"
              ? "Paid via UPI"
              : "Paid Online (Razorpay)"}
          </p>
        </div>
        <div>
          <p className="text-muted mb-1">Payment Status</p>
          <p className={order.isPaid ? "text-ink" : "text-crimson"}>
            {order.isPaid ? "Paid" : order.paymentMethod === "COD" ? "Pay on delivery" : "Pending"}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-10">
        <h2 className="font-display text-lg text-ink mb-4">
          Items ({order.orderItems.reduce((n, i) => n + i.quantity, 0)})
        </h2>
        {order.orderItems.map((item, i) => (
          <div key={i} className="flex gap-4 py-4 border-b border-sand">
            <div className="w-16 h-20 bg-sand shrink-0 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-sm">
              <p className="text-ink">{item.name}</p>
              <p className="text-muted mt-1">
                {item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}
              </p>
            </div>
            <p className="text-ink font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      {/* Shipping address */}
      <div className="mb-10">
        <h2 className="font-display text-lg text-ink mb-3">Shipping To</h2>
        <p className="text-sm text-muted leading-relaxed">
          {order.shippingAddress.fullName}
          <br />
          {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
          {order.shippingAddress.pincode}
          <br />
          {order.shippingAddress.country} · {order.shippingAddress.phone}
        </p>
      </div>

      {/* Price summary */}
      <div className="border-t border-sand pt-6 space-y-2 mb-12">
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span>{formatPrice(order.itemsPrice)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-crimson">
            <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
            <span>−{formatPrice(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-muted">
          <span>Shipping</span>
          <span>{order.shippingPrice === 0 ? "Free" : formatPrice(order.shippingPrice)}</span>
        </div>
        <div className="flex justify-between text-ink font-medium text-lg pt-2 border-t border-sand">
          <span>Total Paid</span>
          <span>{formatPrice(order.totalPrice)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to={`/orders/${order._id}`}
          className="flex-1 text-center bg-ink text-ivory py-3 hover:bg-crimson transition-colors"
        >
          View Order Details
        </Link>
        <Link
          to="/products"
          className="flex-1 text-center border border-ink text-ink py-3 hover:border-crimson hover:text-crimson transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;