import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const statusColors = {
  Processing: "text-muted", Shipped: "text-ink", "Out for Delivery": "text-ink",
  Delivered: "text-green-700", Cancelled: "text-crimson",
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
      <h2 className="font-display text-2xl text-ink mb-8">Orders</h2>
      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="block border border-sand p-4 text-sm hover:border-ink transition-colors">
              <div className="flex justify-between">
                <span className="text-ink">#{order._id.slice(-8).toUpperCase()}</span>
                <span className={`font-medium ${statusColors[order.orderStatus]}`}>{order.orderStatus}</span>
              </div>
              <div className="flex justify-between text-muted mt-1">
                <span>{order.orderItems.length} item(s)</span>
                <span className="text-ink">₹{order.totalPrice}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;