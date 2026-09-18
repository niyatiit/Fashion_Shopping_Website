import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { formatPrice } from "../utils/formatPrice";

const statusBadges = {
  Processing: "bg-amber-50 text-amber-800 border-amber-200",
  Shipped: "bg-blue-50 text-blue-800 border-blue-200",
  "Out for Delivery": "bg-purple-50 text-purple-800 border-purple-200",
  Delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-800 border-rose-200",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosInstance.get("/orders/myorders");
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-crimson border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 bg-sand/40 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          🛍️
        </div>
        <h1 className="font-display text-2xl text-ink mb-2">No orders placed yet</h1>
        <p className="text-muted mb-6">Explore our latest fashion collections and place your first order.</p>
        <Link to="/products" className="inline-block bg-ink text-ivory px-8 py-3 hover:bg-crimson transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-sand">
        <div>
          <h1 className="font-display text-3xl text-ink">My Orders</h1>
          <p className="text-sm text-muted mt-1">
            Track and manage your recent purchases ({orders.length} total)
          </p>
        </div>
        <Link
          to="/products"
          className="text-xs uppercase tracking-widest text-ink hover:text-crimson font-medium self-start sm:self-auto transition-colors"
        >
          + Continue Shopping
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const totalQty = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          const orderRef = order._id.slice(-8).toUpperCase();
          const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={order._id}
              className="border border-sand bg-white shadow-sm hover:border-ink/70 transition-all rounded-sm overflow-hidden"
            >
              {/* Order Meta Header */}
              <div className="bg-sand/20 border-b border-sand px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-muted block text-[11px]">ORDER PLACED</span>
                    <span className="font-medium text-ink">{orderDate}</span>
                  </div>
                  <div className="border-l border-sand/80 pl-4">
                    <span className="text-muted block text-[11px]">ORDER REF</span>
                    <span className="font-mono font-semibold text-ink">#{orderRef}</span>
                  </div>
                  <div className="border-l border-sand/80 pl-4">
                    <span className="text-muted block text-[11px]">PAYMENT</span>
                    <span className="font-medium text-ink">
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : order.paymentMethod === "UPI"
                        ? "Paid via UPI"
                        : "Paid Online"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                      statusBadges[order.orderStatus] || "bg-sand text-ink border-sand"
                    }`}
                  >
                    ● {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items in Order */}
              <div className="p-5 divide-y divide-sand/50">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 py-3.5 first:pt-0 last:pb-0 items-center">
                    <div className="w-16 h-20 bg-sand/30 shrink-0 overflow-hidden rounded-sm border border-sand/50">
                      <img
                        src={item.image || "https://placehold.co/400x500?text=No+Image"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/400x500?text=FashionHub";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-ink text-sm truncate">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted">
                        {item.size && (
                          <span className="bg-sand/40 px-1.5 py-0.5 rounded text-[11px] font-medium text-ink">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="bg-sand/40 px-1.5 py-0.5 rounded text-[11px] font-medium text-ink">
                            Color: {item.color}
                          </span>
                        )}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <p className="text-xs text-ink/80 font-medium mt-1.5">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-sm text-ink">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Card Footer */}
              <div className="bg-sand/10 border-t border-sand px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="text-xs text-muted">
                  {order.shippingAddress?.city && (
                    <span>
                      Shipping to:{" "}
                      <strong className="text-ink font-medium">
                        {order.shippingAddress.fullName} ({order.shippingAddress.city},{" "}
                        {order.shippingAddress.state})
                      </strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 ml-auto">
                  <div className="text-right">
                    <span className="text-xs text-muted block">Total ({totalQty} items):</span>
                    <span className="text-ink font-semibold text-base">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1.5 bg-ink text-ivory px-4 py-2 text-xs uppercase tracking-wider font-medium hover:bg-crimson transition-colors rounded-sm"
                  >
                    <span>View Details</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;