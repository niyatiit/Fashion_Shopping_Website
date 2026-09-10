import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";
import OrderTable from "../../components/admin/OrderTable";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get("/orders");
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { orderStatus: status });
      await fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      <AdminSidebar />
      <div className="flex-1">
        <h1 className="font-display text-3xl text-ink mb-10">Orders</h1>
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          <OrderTable orders={orders} onStatusChange={handleStatusChange} />
        )}
      </div>
    </div>
  );
};

export default ManageOrders;