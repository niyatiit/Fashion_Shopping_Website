import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { formatPrice } from "../../utils/formatPrice";

const statusBadges = {
  Processing: "bg-amber-50 text-amber-800 border-amber-200",
  Shipped: "bg-blue-50 text-blue-800 border-blue-200",
  "Out for Delivery": "bg-purple-50 text-purple-800 border-purple-200",
  Delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-800 border-rose-200",
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosInstance.get("/orders/myorders");
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-6">Recent Orders</h2>
      {loading ? (
        <p className="text-sm text-muted">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-sand p-8 text-center">
          <p className="text-sm text-muted mb-4">No orders placed yet.</p>
          <Link
            to="/products"
            className="inline-block bg-ink text-ivory px-5 py-2 text-xs uppercase tracking-wider hover:bg-crimson transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.orderItems?.[0];
            const extraCount = (order.orderItems?.length || 0) - 1;

            return (
              <div
                key={order._id}
                className="border border-sand p-4 text-sm bg-white hover:border-ink/70 transition-all rounded-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand/60 pb-3 mb-3">
                  <div>
                    <span className="font-mono font-semibold text-ink">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-muted ml-2">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      statusBadges[order.orderStatus] || "bg-sand text-ink"
                    }`}
                  >
                    ● {order.orderStatus}
                  </span>
                </div>

                {firstItem && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-14 bg-sand/30 shrink-0 overflow-hidden rounded-sm border border-sand/60">
                      <img
                        src={firstItem.image || "https://placehold.co/400x500?text=No+Image"}
                        alt={firstItem.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/400x500?text=FashionHub";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-medium text-ink truncate">{firstItem.name}</p>
                      <p className="text-muted mt-0.5">
                        {firstItem.size && `Size: ${firstItem.size}`} {firstItem.color && `· ${firstItem.color}`} · Qty: {firstItem.quantity}
                      </p>
                      {extraCount > 0 && (
                        <p className="text-muted text-[11px] mt-0.5">
                          + {extraCount} more item{extraCount > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink">{formatPrice(order.totalPrice)}</p>
                      <p className="text-[11px] text-muted">
                        {order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-sand/40 flex justify-end">
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-xs uppercase tracking-wider font-medium text-crimson hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;