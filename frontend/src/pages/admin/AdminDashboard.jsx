import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          axiosInstance.get("/products?limit=1"),
          axiosInstance.get("/orders"),
          axiosInstance.get("/users"),
        ]);

        const revenue = ordersRes.data
          .filter((o) => o.isPaid || o.paymentMethod === "COD")
          .reduce((sum, o) => sum + o.totalPrice, 0);

        setStats({
          products: productsRes.data.totalProducts,
          orders: ordersRes.data.length,
          users: usersRes.data.length,
          revenue,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products },
    { label: "Total Orders", value: stats.orders },
    { label: "Total Users", value: stats.users },
    { label: "Revenue", value: `₹${stats.revenue}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      <AdminSidebar />
      <div className="flex-1">
        <h1 className="font-display text-3xl text-ink mb-10">Dashboard</h1>

        {loading ? (
          <p className="text-muted text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {cards.map((card) => (
              <div key={card.label} className="border border-sand p-5">
                <p className="text-sm text-muted mb-2">{card.label}</p>
                <p className="font-display text-2xl text-ink">{card.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;