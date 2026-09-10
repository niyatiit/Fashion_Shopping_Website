import { Link } from "react-router-dom";

const statusOptions = ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

const OrderTable = ({ orders, onStatusChange }) => {
  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div key={order._id} className="flex items-center justify-between border border-sand px-4 py-3 text-sm">
          <div>
            <Link to={`/orders/${order._id}`} className="text-ink hover:text-crimson transition-colors">
              #{order._id.slice(-8).toUpperCase()}
            </Link>
            <p className="text-muted">{order.user?.name} · ₹{order.totalPrice}</p>
          </div>
          <select
            value={order.orderStatus}
            onChange={(e) => onStatusChange(order._id, e.target.value)}
            className="border border-sand px-2 py-1.5 text-sm focus:outline-none focus:border-crimson"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default OrderTable;