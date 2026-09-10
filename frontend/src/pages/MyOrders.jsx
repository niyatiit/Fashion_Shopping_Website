import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const statusColors = {
  Processing: "text-muted",
  Shipped: "text-ink",
  "Out for Delivery": "text-ink",
  Delivered: "text-green-700",
  Cancelled: "text-crimson",
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

  if (loading) return <p className="text-center text-muted py-20">Loading...</p>;

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">No orders yet</h1>
        <Link to="/products" className="inline-block bg-ink text-ivory px-8 py-3 hover:bg-crimson transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block border border-sand p-5 hover:border-ink transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-muted">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-muted">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p className={`text-sm font-medium ${statusColors[order.orderStatus]}`}>
                {order.orderStatus}
              </p>
            </div>
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-ink">{order.orderItems.length} item(s)</p>
              <p className="text-ink font-medium">₹{order.totalPrice}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;