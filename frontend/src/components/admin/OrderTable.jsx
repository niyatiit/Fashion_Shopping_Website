import { useState } from "react";
import { Link } from "react-router-dom";

const statusOptions = ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

const statusBadgeStyles = {
  Processing: "bg-amber-50 text-amber-800 border-amber-200",
  Shipped: "bg-blue-50 text-blue-800 border-blue-200",
  "Out for Delivery": "bg-indigo-50 text-indigo-800 border-indigo-200",
  Delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Cancelled: "bg-stone-100 text-stone-600 border-stone-200",
};

const OrderTable = ({ orders, onStatusChange }) => {
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleExpand = (id) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-sand text-sm text-muted">
        No orders found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isExpanded = Boolean(expandedOrders[order._id]);
        const items = order.orderItems || [];
        const primaryItem = items[0];
        const extraItemsCount = items.length - 1;

        return (
          <div
            key={order._id}
            className="border border-sand bg-white transition-all shadow-xs hover:border-ink/40"
          >
            {/* Header row */}
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Product Thumbnail and Names */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Product Thumbnail */}
                <div className="w-14 h-16 bg-sand shrink-0 overflow-hidden rounded-xs border border-sand/60">
                  <img
                    src={
                      primaryItem?.image ||
                      primaryItem?.product?.images?.[0]?.url ||
                      "https://placehold.co/100x120?text=Product"
                    }
                    alt={primaryItem?.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Information */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink text-sm">
                      {primaryItem?.name || primaryItem?.product?.name || "Fashion Product"}
                    </span>
                    {extraItemsCount > 0 && (
                      <span className="bg-sand/60 text-ink text-[11px] px-2 py-0.5 rounded font-medium">
                        +{extraItemsCount} more item{extraItemsCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted mt-0.5">
                    Qty: <strong className="text-ink">{primaryItem?.quantity || 1}</strong>
                    {primaryItem?.size && <span> · Size: {primaryItem.size}</span>}
                    <span> · ₹{primaryItem?.price || 0} each</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-1.5">
                    <span>Order: </span>
                    <Link
                      to={`/orders/${order._id}`}
                      className="font-mono text-crimson font-medium hover:underline"
                    >
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                    <span>·</span>
                    <span>Customer: <strong className="text-ink">{order.user?.name || order.shippingAddress?.fullName || "Shopper"}</strong></span>
                    {order.user?.email && <span className="hidden sm:inline">({order.user.email})</span>}
                  </div>
                </div>
              </div>

              {/* Price, Payment & Status Controls */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-sand">
                <div className="text-left md:text-right">
                  <p className="font-display text-base text-ink font-semibold">₹{order.totalPrice}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] uppercase font-semibold text-muted tracking-wide">
                      {order.paymentMethod}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                        order.isPaid
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {order.isPaid ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => onStatusChange(order._id, e.target.value)}
                    className={`border px-2.5 py-1.5 text-xs font-medium focus:outline-none cursor-pointer rounded-xs ${
                      statusBadgeStyles[order.orderStatus] || "border-sand text-ink"
                    }`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => toggleExpand(order._id)}
                    className="border border-sand px-2.5 py-1.5 text-xs text-muted hover:text-ink hover:border-ink transition-colors"
                    title="Toggle details"
                  >
                    {isExpanded ? "▲ Less" : "▼ Items"}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded items list if order has multiple items or admin wants details */}
            {isExpanded && (
              <div className="border-t border-sand bg-sand/15 p-4 space-y-3 text-xs">
                <p className="font-semibold text-ink uppercase tracking-wider text-[11px]">
                  All Items in this Order ({items.length}):
                </p>
                <div className="divide-y divide-sand/60">
                  {items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.image ||
                            item.product?.images?.[0]?.url ||
                            "https://placehold.co/80x100?text=Product"
                          }
                          alt=""
                          className="w-8 h-10 object-cover bg-sand rounded-xs shrink-0"
                        />
                        <div>
                          <p className="font-medium text-ink">
                            {item.name || item.product?.name || "Product"}
                          </p>
                          <p className="text-muted">
                            {item.size ? `Size: ${item.size}` : "Standard Size"} · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-ink">₹{(item.price || 0) * (item.quantity || 1)}</p>
                    </div>
                  ))}
                </div>

                {order.shippingAddress && (
                  <div className="pt-2 border-t border-sand/60 text-muted">
                    <strong className="text-ink">Deliver to: </strong>
                    {order.shippingAddress.fullName}, {order.shippingAddress.address},{" "}
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode} (Phone: {order.shippingAddress.phone})
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTable;